// src/utils/exportUsersToExcel.js
import * as XLSX from "xlsx";
import { getUsers, getAverageRating } from "../lib/storage";

// 🔐 тот же список админов, что и в App.jsx / AdminUsers
const ADMIN_EMAILS = ["skill2skilladmin@gmail.com"].map((e) =>
  e.toLowerCase().trim()
);

function filterNonAdminUsers(source) {
  const all = source || getUsers();

  return (all || []).filter((u) => {
    const email = (u.email || "").toLowerCase().trim();
    return email && !ADMIN_EMAILS.includes(email);
  });
}

/**
 * Для совместимости: если где-то ещё вызывается loadUsersFromStorage,
 * просто отдаём список пользователей (без админов).
 */
export function loadUsersFromStorage() {
  return filterNonAdminUsers();
}

/**
 * Экспорт пользователей в Excel.
 *
 * Если передать массив users, используем его (например, то,
 * что уже подгрузили из Firestore в AdminUsers).
 * Если не передавать аргументы — берём пользователей из localStorage (getUsers()).
 */
export function exportUsersToExcel(passedUsers) {
  const users = filterNonAdminUsers(passedUsers);

  const rows = users.map((u, index) => ({
    "#": index + 1,
    Имя: u.fullName || u.name || "", // на будущее, если добавишь имя
    Email: u.email || "",
    "Учит (offers)": Array.isArray(u.offers) ? u.offers.join(", ") : "",
    "Хочет изучать (wants)": Array.isArray(u.wants) ? u.wants.join(", ") : "",
    План: u.sub?.plan || "basic",
    "Средний рейтинг": u.email ? getAverageRating(u.email) || "" : "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");

  XLSX.writeFile(wb, "skill2skill_users.xlsx");
}
