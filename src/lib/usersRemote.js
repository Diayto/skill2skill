// src/lib/usersRemote.js
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const USERS_COL = "users";

// создать/обновить профиль пользователя в Firestore
export async function upsertRemoteUser(user) {
  if (!user?.email) return;

  const {
    email,
    name = "",
    bio = "",
    photo = "",
    wants = [],
    offers = [],
    telegram = "",
    instagram = "",
    ratings = [],
    sub,
    createdAt,
  } = user;

  // Нормализуем wants/offers, чтобы в базе всегда были массивы
  const normalizedWants = Array.isArray(wants)
    ? wants
    : typeof wants === "string" && wants.trim()
    ? wants
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

  const normalizedOffers = Array.isArray(offers)
    ? offers
    : typeof offers === "string" && offers.trim()
    ? offers
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

  // Нормализуем подписку
  const normalizedSub =
    sub && typeof sub === "object"
      ? { plan: sub.plan || "basic" }
      : { plan: "basic" };

  const ref = doc(db, USERS_COL, email);

  const payload = {
    email,
    name,
    bio,
    photo,
    wants: normalizedWants,
    offers: normalizedOffers,
    telegram,
    instagram,
    ratings: Array.isArray(ratings) ? ratings : [],
    sub: normalizedSub,          // объект подписки
    subPlan: normalizedSub.plan, // на всякий случай отдельным полем
    createdAt: createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, payload, { merge: true });
}

// удалить пользователя по email (для админа)
export async function deleteRemoteUser(email) {
  if (!email) return;
  const ref = doc(db, USERS_COL, email);
  await deleteDoc(ref);
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
