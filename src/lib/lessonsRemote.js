// src/lib/lessonsRemote.js
import {
  doc,
  getDoc,
  setDoc,
  writeBatch,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { getLessonsCap } from "./storage"; // берём кап из текущего плана (basic/plus/pro)

// --- helpers ---

function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function creditDocId(email) {
  return `${String(email || "").toLowerCase()}_${todayYMD()}`;
}

function creditDocRef(email) {
  return doc(db, "lessonCredits", creditDocId(email));
}

function sessionDocId(a, b) {
  return [String(a || "").toLowerCase(), String(b || "").toLowerCase()]
    .sort()
    .join("::");
}

function sessionDocRef(a, b) {
  return doc(db, "lessonSessions", sessionDocId(a, b));
}

// --- публичные функции ---

/**
 * Получаем остаток уроков на сегодня для пользователя из Firestore.
 * Если записи нет или день сменился — заводим новую с полным капом.
 */
export async function getLessonsRemainingRemote(email) {
  const capRaw = getLessonsCap(email);
  const cap = Number.isFinite(capRaw) ? capRaw : 9999;

  const ref = creditDocRef(email);
  const snap = await getDoc(ref);
  const today = todayYMD();
  const now = Date.now();

  if (!snap.exists()) {
    const data = {
      email,
      date: today,
      remaining: cap,
      cap,
      updatedAt: now,
    };
    await setDoc(ref, data);
    return cap;
  }

  const data = snap.data() || {};
  // новый день — сбрасываем лимит
  if (data.date !== today) {
    const fresh = {
      ...data,
      email,
      date: today,
      remaining: cap,
      cap,
      updatedAt: now,
    };
    await setDoc(ref, fresh);
    return cap;
  }

  let remaining =
    typeof data.remaining === "number" && !Number.isNaN(data.remaining)
      ? data.remaining
      : cap;

  // если вдруг в старых данных больше капа — подрежем
  if (remaining > cap) remaining = cap;

  return Math.max(0, remaining);
}

/**
 * Старт урока на 1 час:
 *  - проверяем лимиты обоих в Firestore,
 *  - если ок — списываем по 1 уроку у обоих,
 *  - создаём/обновляем сессию в коллекции lessonSessions.
 */
export async function startLessonRemote(aEmail, bEmail) {
  const capAraw = getLessonsCap(aEmail);
  const capBraw = getLessonsCap(bEmail);
  const capA = Number.isFinite(capAraw) ? capAraw : 9999;
  const capB = Number.isFinite(capBraw) ? capBraw : 9999;

  const today = todayYMD();
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  const refA = creditDocRef(aEmail);
  const refB = creditDocRef(bEmail);
  const sessRef = sessionDocRef(aEmail, bEmail);

  const [snapA, snapB] = await Promise.all([getDoc(refA), getDoc(refB)]);

  const normalizeCredit = (snap, email, cap) => {
    if (!snap.exists()) {
      return {
        email,
        date: today,
        remaining: cap,
        cap,
      };
    }
    const data = snap.data() || {};
    if (data.date !== today) {
      return {
        ...data,
        email,
        date: today,
        remaining: cap,
        cap,
      };
    }
    let remaining =
      typeof data.remaining === "number" && !Number.isNaN(data.remaining)
        ? data.remaining
        : cap;
    if (remaining > cap) remaining = cap;
    return {
      ...data,
      email,
      date: today,
      remaining,
      cap,
    };
  };

  let creditA = normalizeCredit(snapA, aEmail, capA);
  let creditB = normalizeCredit(snapB, bEmail, capB);

  if (creditA.remaining <= 0 || creditB.remaining <= 0) {
    return { ok: false, reason: "no-credits" };
  }

  creditA = {
    ...creditA,
    remaining: creditA.remaining - 1,
    updatedAt: now,
  };
  creditB = {
    ...creditB,
    remaining: creditB.remaining - 1,
    updatedAt: now,
  };

  const session = {
    a: aEmail,
    b: bEmail,
    start: now,
    end: now + oneHour,
    active: true,
    debited: true,
    updatedAt: now,
  };

  const batch = writeBatch(db);
  batch.set(refA, creditA);
  batch.set(refB, creditB);
  batch.set(sessRef, session);
  await batch.commit();

  return { ok: true, session: { id: sessRef.id, ...session } };
}

/**
 * Реалтайм-подписка на сессию урока между двумя пользователями.
 * cb(null) если сессии нет.
 */
export function subscribeToSession(aEmail, bEmail, cb) {
  const ref = sessionDocRef(aEmail, bEmail);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      cb(null);
    } else {
      cb({ id: snap.id, ...snap.data() });
    }
  });
}
