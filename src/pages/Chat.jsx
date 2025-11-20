// src/pages/Chat.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getAuth,
  getUser,
  getLessonsCap,
  getVideoRoomUrl,
} from "../lib/storage";

import {
  subscribeToMessages,
  sendMessageRemote,
  markReadRemote,
} from "../lib/chatRemote";

import {
  getLessonsRemainingRemote,
  startLessonRemote,
  subscribeToSession,
} from "../lib/lessonsRemote";

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

  const auth = getAuth();
  const me = auth?.email || "";

  const other = getUser(email) || { email };

  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);

  // кредиты уроков на сегодня (из Firestore)
  const [myRemain, setMyRemain] = useState(null);
  const [otherRemain, setOtherRemain] = useState(null);

  // сессия урока (общая для обоих)
  const [session, setSession] = useState(null);

  // тикер раз в секунду, чтобы таймер обновлялся
  const [tick, setTick] = useState(0);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!me) nav("/login");
  }, [me, nav]);

  // ---------- ЧАТ: подписка на Firestore ----------
  useEffect(() => {
    if (!me || !email) return;
    const unsub = subscribeToMessages(email, me, async (list) => {
      setMessages(list);
      try {
        await markReadRemote(email, me);
      } catch (e) {
        console.error("Failed to markReadRemote", e);
      }
    });
    return () => unsub && unsub();
  }, [me, email]);

  // автоскролл при новых сообщениях
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  // ---------- УРОКИ: начальные кредиты ----------
  useEffect(() => {
    if (!me || !email) return;
    let canceled = false;

    async function loadCredits() {
      try {
        const [mine, otherLeft] = await Promise.all([
          getLessonsRemainingRemote(me),
          getLessonsRemainingRemote(email),
        ]);
        if (!canceled) {
          setMyRemain(mine);
          setOtherRemain(otherLeft);
        }
      } catch (e) {
        console.error("loadCredits error", e);
      }
    }
    loadCredits();

    return () => {
      canceled = true;
    };
  }, [me, email]);

  // ---------- УРОКИ: подписка на сессию ----------
  useEffect(() => {
    if (!me || !email) return;
    const unsub = subscribeToSession(me, email, (sess) => {
      setSession(sess);
    });
    return () => unsub && unsub();
  }, [me, email]);

  // тикер для таймера (каждую секунду перерисовываем)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const myCap = getLessonsCap(me);
  const otherCap = getLessonsCap(email);

  const leftMs = session ? Math.max(0, session.end - Date.now()) : 0;
  const lessonActive = !!(session && session.active && leftMs > 0);

  // ссылка на видеокомнату для пары (одинаковая у обоих)
  const videoUrl = lessonActive ? getVideoRoomUrl(me, email) : "";

  const handleSend = async () => {
    if (!draft.trim()) return;
    try {
      await sendMessageRemote(email, me, draft);
      setDraft("");
      inputRef.current?.focus();
    } catch (err) {
      console.error("sendMessageRemote error", err);
      alert("Не удалось отправить сообщение. Попробуйте ещё раз.");
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onStartLesson = async () => {
    try {
      const res = await startLessonRemote(me, email);
      if (!res.ok && res.reason === "no-credits") {
        alert("Недостаточно уроков на сегодня у одного из участников.");
        return;
      }
      // обновим кредиты после старта урока
      const [mine, otherLeft] = await Promise.all([
        getLessonsRemainingRemote(me),
        getLessonsRemainingRemote(email),
      ]);
      setMyRemain(mine);
      setOtherRemain(otherLeft);
    } catch (e) {
      console.error("startLessonRemote error", e);
      alert("Не удалось начать урок. Попробуйте ещё раз.");
    }
  };

  const canStart =
    (myRemain ?? 0) > 0 && (otherRemain ?? 0) > 0 && !lessonActive;

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
          {/* Информация о кредитах на сегодня (из Firestore) */}
          <div className="pill">
            Мои уроки: <b>{myRemain ?? "…"}</b>/{myCap}
          </div>
          <div className="pill">
            Его уроки: <b>{otherRemain ?? "…"}</b>/{otherCap}
          </div>

          {!lessonActive ? (
            <button
              className="btn btn-primary"
              onClick={onStartLesson}
              disabled={!canStart}
              title="Старт урока ровно на 1 час"
            >
              Начать урок
            </button>
          ) : (
            <div className="timer-pill" title="Идёт урок">
              ⏳ {fmtTimer(leftMs)}
            </div>
          )}

          <Link className="btn" to={`/profile/${encodeURIComponent(email)}`}>
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
        {messages.length === 0 ? (
          <div className="chat-empty">
            Начните диалог — представьтесь и кратко опишите запрос 🙂
          </div>
        ) : (
          messages.map((m) => (
            <Bubble
              key={m.id || m.ts}
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
        <button className="btn btn-primary" onClick={handleSend}>
          Отправить
        </button>
      </div>
    </div>
  );
}
