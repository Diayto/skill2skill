// src/pages/AdminUsers.jsx
import { useEffect, useState } from "react";
import { getAverageRating } from "../lib/storage";
import { fetchRemoteUsers } from "../lib/usersRemote";
import { exportUsersToExcel } from "../utils/exportUsersToExcel";

// 🔐 тот же список админов, что и в App.jsx / Sidebar
const ADMIN_EMAILS = ["skill2skilladmin@gmail.com"].map((e) =>
  e.toLowerCase().trim()
);

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchRemoteUsers();

        // фильтруем админ-аккаунты, чтобы не светились в таблице
        const filtered = (list || []).filter((u) => {
          const email = (u.email || "").toLowerCase().trim();
          return email && !ADMIN_EMAILS.includes(email);
        });

        setUsers(filtered);
      } catch (e) {
        console.error("Failed to load users from Firestore", e);
        setLoadError("Не удалось загрузить пользователей из базы данных.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const total = users.length;

  return (
    <div className="admin-wrap">
      <div className="admin-inner">
        <header className="admin-header">
          <div>
            <h1 className="admin-title">Зарегистрированные пользователи</h1>

            {loading ? (
              <p className="admin-sub">Загружаем данные…</p>
            ) : (
              <p className="admin-sub">
                Всего профилей (без админов): <strong>{total}</strong>
              </p>
            )}

            {loadError && (
              <p className="admin-empty" style={{ marginTop: 4 }}>
                {loadError}
              </p>
            )}
          </div>

          <button
            className="btn btn-primary admin-refresh"
            onClick={() => exportUsersToExcel(users)}
            disabled={!users.length}
            title={users.length ? "Скачать Excel" : "Нет данных для экспорта"}
          >
            Скачать Excel
          </button>
        </header>

        {!loading && !users.length && !loadError && (
          <p className="admin-empty">
            Пока нет пользователей в базе. Сначала кто-то должен
            зарегистрироваться.
          </p>
        )}

        {!loading && !!users.length && (
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
                    <td>
                      {u.email ? getAverageRating(u.email) || "—" : "—"}
                    </td>
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
