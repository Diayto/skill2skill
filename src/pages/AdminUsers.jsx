// src/pages/AdminUsers.jsx
import { useEffect, useState } from "react";
import { getUsers, getAverageRating } from "../lib/storage";
import { exportUsersToExcel } from "../utils/exportUsersToExcel";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // берём всех пользователей из s2s-users
    setUsers(getUsers());
  }, []);

  const total = users.length;

  return (
    <div className="admin-wrap">
      <div className="admin-inner">
        <header className="admin-header">
          <div>
            <h1 className="admin-title">Зарегистрированные пользователи</h1>
            <p className="admin-sub">
              Всего профилей: <strong>{total}</strong>
            </p>
          </div>

          <button
            className="btn btn-primary admin-refresh"
            onClick={exportUsersToExcel}
          >
            Скачать Excel
          </button>
        </header>

        {users.length === 0 ? (
          <p className="admin-empty">
            Пока нет пользователей. Сначала кто-то должен зарегистрироваться.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Учит (offers)</th>
                  <th>Хочет изучать (wants)</th>
                  <th>План</th>
                  <th>Средний рейтинг</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.email || idx}>
                    <td>{idx + 1}</td>
                    <td>{u.email || "—"}</td>
                    <td>
                      {Array.isArray(u.offers) && u.offers.length
                        ? u.offers.join(", ")
                        : "—"}
                    </td>
                    <td>
                      {Array.isArray(u.wants) && u.wants.length
                        ? u.wants.join(", ")
                        : "—"}
                    </td>
                    <td>{u.sub?.plan || "basic"}</td>
                    <td>{getAverageRating(u) || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
