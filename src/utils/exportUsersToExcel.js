// src/utils/exportUsersToExcel.js
import * as XLSX from "xlsx";
import { getUsers, getAverageRating } from "../lib/storage";

/**
 * Для совместимости: если где-то ещё вызывается loadUsersFromStorage,
 * просто отдаём список из getUsers().
 */
export function loadUsersFromStorage() {
  return getUsers();
}

export function exportUsersToExcel() {
  const users = getUsers(); // читаем ВСЕХ пользователей из s2s-users

  const rows = users.map((u, index) => ({
    "#": index + 1,
    "Имя": u.fullName || u.name || "", // на будущее, если добавишь имя
    "Email": u.email || "",
    "Учит (offers)": Array.isArray(u.offers) ? u.offers.join(", ") : "",
    "Хочет изучать (wants)": Array.isArray(u.wants) ? u.wants.join(", ") : "",
    "План": u.sub?.plan || "basic",
    "Средний рейтинг": getAverageRating(u) || "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Users");

  XLSX.writeFile(wb, "skill2skill_users.xlsx");
}
