// src/lib/storage.js
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { upsertRemoteUser } from "./usersRemote"; // 🔥 добавили

// ---------- USERS / AUTH ----------
const KEY = "s2s-users";
const AUTH = "s2s-auth";

function readAllUsers() {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}
function writeAllUsers(arr) {
  localStorage.setItem(KEY, JSON.stringify(arr));
}

/**
 * Нормализуем объект подписки у пользователя.
 * Поддерживает старый формат { sub: { active: boolean } } => план "plus"/"basic".
 */
function normalizeSub(sub) {
  const hasPlan = sub && typeof sub.plan === "string";
  if (hasPlan) return { plan: sub.plan }; // "basic" | "plus" | "pro"
  // миграция со старого "active"
  const wasActive = !!sub?.active;
  return { plan: wasActive ? "plus" : "basic" };
}

export function saveUser(u) {
  const all = readAllUsers();
  const i = all.findIndex((x) => x.email === u.email);

  let saved;

  if (i >= 0) {
    // не затираем план подписки
    const prev = all[i];
    const keepSub = normalizeSub(prev.sub);
    saved = {
      ...prev,
      ...u,
      sub: keepSub,
    };
    all[i] = saved;
  } else {
    saved = {
      photo: "",
      bio: "",
      wants: [],
      offers: [],
      ratings: [],
      sub: { plan: "basic" }, // по умолчанию — базовый план
      ...u,
    };
    all.push(saved);
  }

  writeAllUsers(all);

  // 🔥 Синхронизируем пользователя в Firestore
  // чтобы другие аккаунты видели его описание, wants/offers и т.д.
  upsertRemoteUser(saved).catch((err) => {
    console.error("[saveUser] upsertRemoteUser error", err);
  });

  return saved;
}

export function getUsers() {
  // также нормализуем при чтении (на случай старых записей)
  return readAllUsers().map((u) => ({ ...u, sub: normalizeSub(u.sub) }));
}
export function getUser(email) {
  const u = readAllUsers().find((u) => u.email === email) || null;
  return u ? { ...u, sub: normalizeSub(u.sub) } : null;
}

export function setAuth(email) {
  localStorage.setItem(AUTH, JSON.stringify({ email }));
}
export function getAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH) || "null");
  } catch {
    return null;
  }
}

// 👇 теперь логаут чистит и localStorage, и Firebase-сессию
export async function logout() {
  localStorage.removeItem(AUTH);
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Firebase signOut failed", e);
  }
}

// ---------- SUBSCRIPTION (plans: basic / plus / pro) ----------
export function getPlan(email) {
  const u = getUser(email);
  return u?.sub?.plan || "basic";
}
export function setPlan(email, plan) {
  const all = readAllUsers();
  const i = all.findIndex((u) => u.email === email);
  if (i < 0) return;
  const prev = all[i];
  all[i] = { ...prev, sub: { plan } };
  writeAllUsers(all);
}

/** Совместимость со старым API */
export function hasSubscription(email) {
  const plan = getPlan(email);
  return plan !== "basic";
}

// ---------- RATING ----------
export function rateUser(targetEmail, score, by) {
  if (!by || !targetEmail || by === targetEmail) return;
  const all = readAllUsers();
  const i = all.findIndex((u) => u.email === targetEmail);
  if (i < 0) return;
  const u = all[i];
  const rix = (u.ratings || []).findIndex((r) => r.by === by);
  if (rix >= 0) u.ratings[rix].score = score;
  else (u.ratings ||= []).push({ by, score });
  all[i] = u;
  writeAllUsers(all);
}
export function getAverageRating(userOrEmail) {
  const u =
    typeof userOrEmail === "string" ? getUser(userOrEmail) : userOrEmail;
  const arr = u?.ratings || [];
  if (!arr.length) return 0;
  const sum = arr.reduce((s, r) => s + (Number(r.score) || 0), 0);
  return Math.round((sum / arr.length) * 10) / 10;
}
export function getMyScoreFor(targetEmail, meEmail) {
  const u = getUser(targetEmail);
  return (u?.ratings || []).find((r) => r.by === meEmail)?.score || 0;
}

// ---------- SHARED: CHAT THREAD ID ----------
function threadId(a, b) {
  return [String(a || "").toLowerCase(), String(b || "").toLowerCase()]
    .sort()
    .join("::");
}

// ---------- CHAT ----------
const CHAT = "s2s-chats";
function readChats() {
  return JSON.parse(localStorage.getItem(CHAT) || "{}");
}
function writeChats(obj) {
  localStorage.setItem(CHAT, JSON.stringify(obj));
}
export function getMessages(withEmail, meEmail) {
  const all = readChats();
  const id = threadId(withEmail, meEmail);
  return all[id] || [];
}
export function sendMessage(withEmail, meEmail, text) {
  if (!withEmail || !meEmail || !text.trim()) return;
  const all = readChats();
  const id = threadId(withEmail, meEmail);
  const arr = all[id] || [];
  arr.push({
    id: crypto.randomUUID(),
    from: meEmail,
    to: withEmail,
    text: text.trim(),
    ts: Date.now(),
    read: false,
  });
  all[id] = arr;
  writeChats(all);
}
export function markRead(withEmail, meEmail) {
  const all = readChats();
  const id = threadId(withEmail, meEmail);
  const arr = all[id] || [];
  let changed = false;
  for (const m of arr) {
    if (m.to === meEmail && !m.read) {
      m.read = true;
      changed = true;
    }
  }
  if (changed) {
    all[id] = arr;
    writeChats(all);
  }
}

// ---------- DAILY LESSONS (cap by plan) ----------
const LESSONS = "s2s-lessons";
const FREE_MAX = 1;
const PLUS_MAX = 3;
const PRO_MAX = Infinity;

export function getLessonsCap(email) {
  const plan = getPlan(email);
  if (plan === "pro") return PRO_MAX;
  if (plan === "plus") return PLUS_MAX;
  return FREE_MAX; // basic
}

function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function readLessons() {
  return JSON.parse(localStorage.getItem(LESSONS) || "{}");
}
function writeLessons(o) {
  localStorage.setItem(LESSONS, JSON.stringify(o));
}

/** Остаток уроков на сегодня (учитывает план и нормализует старые значения). */
export function getLessonsRemaining(email) {
  const cap = getLessonsCap(email);
  const all = readLessons();
  const t = todayYMD();
  const cur = all[email];

  if (!cur || cur.date !== t) {
    all[email] = { date: t, remaining: isFinite(cap) ? cap : 9999 }; // для PRO имитируем "почти бесконечно"
    writeLessons(all);
    return isFinite(cap) ? cap : 9999;
  }

  // если старое значение превышает текущий кап — подрежем
  if (isFinite(cap) && cur.remaining > cap) {
    cur.remaining = cap;
    all[email] = cur;
    writeLessons(all);
  }

  return Math.max(0, cur.remaining | 0);
}

/** Списывает 1 урок за сегодня. Для PRO не ограничиваем (останется большое число). */
export function decrementLesson(email) {
  const cap = getLessonsCap(email);
  const all = readLessons();
  const t = todayYMD();
  const cur = all[email];

  if (!cur || cur.date !== t) {
    const start = isFinite(cap) ? Math.max(0, cap - 1) : 9998;
    all[email] = { date: t, remaining: start };
  } else {
    all[email].remaining = Math.max(0, (cur.remaining | 0) - 1);
  }
  writeLessons(all);
}

export function canStartLesson(aEmail, bEmail) {
  return getLessonsRemaining(aEmail) > 0 && getLessonsRemaining(bEmail) > 0;
}

// ---------- LESSON SESSIONS (1 hour timer) ----------
const SESS = "s2s-lesson-sessions";
function readSessions() {
  return JSON.parse(localStorage.getItem(SESS) || "{}");
}
function writeSessions(o) {
  localStorage.setItem(SESS, JSON.stringify(o));
}

/**
 * Активная сессия: НЕ списывает кредиты.
 * Только помечает урок неактивным, если время вышло.
 */
export function getActiveLesson(aEmail, bEmail) {
  const all = readSessions();
  const id = threadId(aEmail, bEmail);
  const s = all[id];
  if (!s) return null;

  if (Date.now() >= s.end && s.active) {
    s.active = false;
    all[id] = s;
    writeSessions(all);
  }

  return all[id] || null;
}

/**
 * Старт урока:
 *  - проверяем лимит,
 *  - СРАЗУ списываем по 1 уроку у обоих,
 *  - создаём сессию на 1 час.
 */
export function startLesson(aEmail, bEmail) {
  if (!canStartLesson(aEmail, bEmail)) {
    return { ok: false, reason: "no-credits" };
  }

  // сразу списываем кредиты за сегодняшний день
  decrementLesson(aEmail);
  decrementLesson(bEmail);

  const all = readSessions();
  const id = threadId(aEmail, bEmail);
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  all[id] = {
    id,
    a: aEmail,
    b: bEmail,
    start: now,
    end: now + oneHour,
    active: true,
    // кредиты уже списаны, флаг оставлен для совместимости
    debited: true,
  };

  writeSessions(all);
  return { ok: true, session: all[id] };
}

export function remainingMsForLesson(aEmail, bEmail) {
  const s = getActiveLesson(aEmail, bEmail);
  if (!s || !s.active) return 0;
  return Math.max(0, s.end - Date.now());
}

// ---------- VIDEO ROOMS (Jitsi) ----------

/**
 * Генерируем стабильную ссылку видео-комнаты для пары пользователей.
 * Оба участника получат один и тот же URL.
 */
export function getVideoRoomUrl(aEmail, bEmail) {
  const id = threadId(aEmail, bEmail); // например "a@gmail.com::b@gmail.com"
  const safeId = id.replace(/[^a-z0-9]/gi, "-"); // превращаем в безопасное имя
  return `https://meet.jit.si/skill2skill-${safeId}`;
}
