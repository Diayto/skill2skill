import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAuth, getUser } from "../lib/storage";
import {
  getMessages,
  sendMessage,
  markRead,
  getLessonsRemaining,
  canStartLesson,
  startLesson,
  getActiveLesson,
  remainingMsForLesson,
  getLessonsCap,
  getVideoRoomUrl,           // 👈 добавили
} from "../lib/storage";

function Avatar({ user }) {
  if (user?.photo)
    return <img className="chat-ava" src={user.photo} alt="avatar" />;
  const ch = (user?.email?.[0] || "U").toUpperCase();
  return <div className="chat-ava fallback">{ch}</div>;
}

function Bubble({ mine, text, time }) {
  const d = new Date(time);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return (
    <div className={`bubble-row ${mine ? "mine" : ""}`}>
      <div className="bubble">
        <div className="bubble-text">{text}</div>
        <div className="bubble-time">
          {hh}:{mm}
        </div>
      </div>
    </div>
  );
}

function fmtTimer(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(
    2,
    "0"
  )}:${String(s).padStart(2, "0")}`;
}

/**
 * Видеозвонок через Jitsi внутри чата.
 * Пользователь остаётся в приложении, видео встраивается через iframe.
 */
function VideoCall({ roomUrl }) {
  if (!roomUrl) return null;

  return (
    <div className="video-call-wrapper">
      <iframe
        className="video-call-frame"
        src={roomUrl}
        allow="camera; microphone; fullscreen; display-capture"
        title="Видео-звонок"
      />
    </div>
  );
}

export default function Chat() {
  const nav = useNavigate();
  const { email } = useParams(); // собеседник
  const me = getAuth()?.email || "";
  const other = getUser(email) || { email };

  useEffect(() => {
    if (!me) nav("/login");
  }, [me, nav]);

  const [draft, setDraft] = useState("");
  const [tick, setTick] = useState(0);
  const [now, setNow] = useState(Date.now());
  const listRef = useRef(null);
  const inputRef = useRef(null);

  const msgs = useMemo(() => getMessages(email, me), [email, me, tick]);

  // уроки (кредиты) на сегодня
  const myRemain = getLessonsRemaining(me);
  const otherRemain = getLessonsRemaining(email);
  const myCap = getLessonsCap(me); // кап берём из storage (1 без подписки, 3 с подпиской)
  const otherCap = getLessonsCap(email);

  // активная сессия урока и оставшееся время
  const session = getActiveLesson(me, email);
  const leftMs = remainingMsForLesson(me, email);
  const lessonActive = !!(session && session.active && leftMs > 0);

  // ссылка на видеокомнату для этой пары (одинаковая у обоих участников)
  const videoUrl = lessonActive ? getVideoRoomUrl(me, email) : "";

  // автоскролл
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs.length]);

  // отметим входящие прочитанными
  useEffect(() => {
    markRead(email, me);
    setTick((t) => t + 1);
  }, [email, me]);

  // тикер раз в секунду — для таймера
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const send = () => {
    if (!draft.trim()) return;
    sendMessage(email, me, draft);
    setDraft("");
    setTick((t) => t + 1);
    inputRef.current?.focus();
  };
  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const onStartLesson = () => {
    const ok = canStartLesson(me, email);
    if (!ok) {
      // универсальный текст, без конкретных чисел
      alert("Недостаточно уроков на сегодня у одного из участников.");
      return;
    }
    const r = startLesson(me, email);
    if (!r.ok && r.reason === "no-credits") {
      alert("Недостаточно уроков на сегодня у одного из участников.");
      return;
    }
    setTick((t) => t + 1); // перерисуем
  };

  return (
    <div className="chat-shell">
      <div className="chat-head">
        <div className="chat-peer">
          <Avatar user={other} />
          <div className="peer-info">
            <div className="peer-name">{other.email}</div>
            <div className="peer-sub">Личные сообщения</div>
          </div>
        </div>

        <div
          className="chat-actions"
          style={{ gap: 12, alignItems: "center" }}
        >
          {/* Информация о кредитах на сегодня */}
          <div className="pill">
            Мои уроки: <b>{myRemain}</b>/{myCap}
          </div>
          <div className="pill">
            Его уроки: <b>{otherRemain}</b>/{otherCap}
          </div>

          {!lessonActive ? (
            <button
              className="btn btn-primary"
              onClick={onStartLesson}
              disabled={!canStartLesson(me, email)}
              title="Старт урока ровно на 1 час"
            >
              Начать урок
            </button>
          ) : (
            <div className="timer-pill" title="Идёт урок">
              ⏳ {fmtTimer(leftMs)}
            </div>
          )}

          <Link
            className="btn"
            to={`/profile/${encodeURIComponent(email)}`}
          >
            Профиль
          </Link>
          <Link className="btn" to="/home">
            На главную
          </Link>
        </div>
      </div>

      {/* Видеозвонок внутри приложения — только когда урок активен */}
      {lessonActive && <VideoCall roomUrl={videoUrl} />}

      <div className="chat-body" ref={listRef}>
        {msgs.length === 0 ? (
          <div className="chat-empty">
            Начните диалог — представьтесь и кратко опишите запрос 🙂
          </div>
        ) : (
          msgs.map((m) => (
            <Bubble
              key={m.id}
              mine={m.from === me}
              text={m.text}
              time={m.ts}
            />
          ))
        )}
      </div>

      <div className="chat-input">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder="Напишите сообщение... (Enter — отправить, Shift+Enter — перенос)"
          rows={2}
        />
        <button className="btn btn-primary" onClick={send}>
          Отправить
        </button>
      </div>
    </div>
  );
}
