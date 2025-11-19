import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import UserCard from "../components/UserCard";
import { getUsers } from "../lib/storage";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState("all"); // all | offers | wants

  const users = getUsers();

  const filtered = useMemo(() => {
    let list = users;

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
  }, [users, q, mode]);

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

          {/* Список пользователей */}
          {filtered.length === 0 ? (
            <div className="card home-empty">
              <h3>Пока никого не нашлось</h3>
              <p>
                Попробуй изменить запрос или снять фильтр сверху. <br />
                После Skill Day новые анкеты появятся здесь автоматически.
              </p>
            </div>
          ) : (
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
