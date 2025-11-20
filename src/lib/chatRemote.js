// src/lib/chatRemote.js
import {
  collection,
  doc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

function threadId(a, b) {
  return [String(a || "").toLowerCase(), String(b || "").toLowerCase()]
    .sort()
    .join("::");
}

/**
 * Реалтайм-подписка на сообщения чата.
 */
export function subscribeToMessages(withEmail, meEmail, cb) {
  if (!withEmail || !meEmail) return () => {};

  const id = threadId(withEmail, meEmail);
  const msgsRef = collection(db, "threads", id, "messages");
  const q = query(msgsRef, orderBy("ts", "asc"));

  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    cb(list);
  });
}

/**
 * Отправить сообщение в Firestore.
 */
export async function sendMessageRemote(withEmail, meEmail, text) {
  if (!withEmail || !meEmail || !text.trim()) return;

  const id = threadId(withEmail, meEmail);
  const msgsRef = collection(db, "threads", id, "messages");

  await addDoc(msgsRef, {
    from: meEmail,
    to: withEmail,
    text: text.trim(),
    ts: Date.now(),
    read: false,
  });
}

/**
 * Пометить входящие как прочитанные.
 */
export async function markReadRemote(withEmail, meEmail) {
  if (!withEmail || !meEmail) return;

  const id = threadId(withEmail, meEmail);
  const msgsRef = collection(db, "threads", id, "messages");

  const q = query(
    msgsRef,
    where("to", "==", meEmail),
    where("read", "==", false)
  );

  const snap = await getDocs(q);
  if (snap.empty) return;

  const batch = writeBatch(db);
  snap.forEach((docSnap) => {
    batch.update(docSnap.ref, { read: true });
  });

  await batch.commit();
}
