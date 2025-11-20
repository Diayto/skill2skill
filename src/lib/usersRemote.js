// src/lib/usersRemote.js
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const USERS_COL = "users";

// создать/обновить профиль пользователя в Firestore
export async function upsertRemoteUser(user) {
  if (!user?.email) return;

  const ref = doc(db, USERS_COL, user.email);
  const payload = {
    email: user.email,
    name: user.name || "",
    bio: user.bio || "",
    photo: user.photo || "",
    createdAt: user.createdAt || serverTimestamp(),
  };

  await setDoc(ref, payload, { merge: true });
}

// получить одного пользователя по email
export async function fetchRemoteUser(email) {
  const ref = doc(db, USERS_COL, email);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// получить всех пользователей
export async function fetchRemoteUsers() {
  const colRef = collection(db, USERS_COL);
  const snap = await getDocs(colRef);
  return snap.docs.map((d) => d.data());
}
