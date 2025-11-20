import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import UserCard from "../components/UserCard";
import { getUsers, getAuth } from "../lib/storage";
import { fetchRemoteUsers } from "../lib/usersRemote"; // 🔥 Firestore

// 🔐 тот же список админов, что и в App / AdminUsers / exportUsersToExcel
const ADMIN_EMAILS = ["skill2skilladmin@gmail.com"].map((e) =>
  e.toLowerCase().trim()
);

export default function Home() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState("all"); // all | offers | wants

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // текущий пользователь
  const me = getAuth();
  const myEmail = (me?.email || "").toLowerCase().trim();

  // один раз при монтировании грузим список
  useEffect(() => {
    async function load() {
      try {
        const list = await fetchRemoteUsers();

        // если в Firestore пока пусто (или мы только что подключили) —
        // чтобы не ломать демо, подхватим локальные данные
        if (!list || list.length === 0) {
          const local = getUsers();
          setUsers(local);
        } else {
          setUsers(list);
        }
      } catch (e) {
        console.error("Failed to load users from Firestore", e);
        setLoadError("Не удалось загрузить пользователей из облака.");
        // fallback на локальный список, чтобы страница не была пустой
        setUsers(getUsers());
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    let list = users || [];

    // 👇 исключаем самого себя
    if (myEmail) {
      list = list.filter(
        (u) => (u.email || "").toLowerCase().trim() !== myEmail
      );
    }

    // 👇 исключаем ВСЕ админ-почты из списка
    list = list.filter((u) => {
      const email = (u.email || "").toLowerCase().trim();
      if (!email) return false;
      return !ADMIN_EMAILS.includes(email);
    });

    const s = q.trim().toLowerCase();
    if (s) {
      list = list.filter((u) => {
        const email = (u.email || "").toLowerCase();
        const bio = (u.bio || "").toLowerCase();
        const offers = (u.offers || []).join(",").toLowerCase();
        const wants = (u.wants || []).join(",").toLowerCase();
        return (
          email.includes(s) ||
          bio.includes(s) ||
          offers.includes(s) ||
          wants.includes(s)
        );
      });
    }

    if (mode === "offers") {
      list = list.filter((u) => (u.offers || []).length > 0);
    } else if (mode === "wants") {
      list = list.filter((u) => (u.wants || []).length > 0);
    }

    return list;
  }, [users, q, mode, myEmail]);

  return (
    <>
      <Navbar
        search={q}
        onSearch={setQ}
        onToggleSidebar={() => setOpen((v) => !v)}
      />
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <main className="under-navbar home-page">
        <div className="container home-shell">
          {/* Верхняя панель: только фильтр по режиму */}
          <section className="home-top">
            <div className="home-filters">
              <span className="home-filters-label">Показать:</span>
              <div className="mode-toggle">
                <button
                  type="button"
                  className={`mode-pill ${mode === "all" ? "is-active" : ""}`}
                  onClick={() => setMode("all")}
                >
                  Все
                </button>
                <button
                  type="button"
                  className={`mode-pill ${
                    mode === "offers" ? "is-active" : ""
                  }`}
                  onClick={() => setMode("offers")}
                >
                  Кто может научить
                </button>
                <button
                  type="button"
                  className={`mode-pill ${
                    mode === "wants" ? "is-active" : ""
                  }`}
                  onClick={() => setMode("wants")}
                >
                  Кто ищет знания
                </button>
              </div>
            </div>
          </section>

          {/* Статус загрузки / ошибка */}
          {loading && (
            <div className="card home-empty">
              <h3>Загружаем пользователей…</h3>
              <p>Это может занять несколько секунд.</p>
            </div>
          )}

          {!loading && loadError && (
            <div className="card home-empty">
              <h3>Есть небольшая проблема</h3>
              <p>{loadError}</p>
            </div>
          )}

          {/* Список пользователей */}
          {!loading && filtered.length === 0 ? (
            <div className="card home-empty">
              <h3>Пока никого не нашлось</h3>
              <p>
                Попробуй изменить запрос или снять фильтр сверху. <br />
                После Skill Day новые анкеты появятся здесь автоматически.
              </p>
            </div>
          ) : null}

          {!loading && filtered.length > 0 && (
            <div className="grid">
              {filtered.map((u, i) => (
                <UserCard key={u.email + i} user={u} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
