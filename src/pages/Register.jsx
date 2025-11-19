import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveUser } from "../lib/storage";
import { isEmail } from "../lib/validators";
import logo from "../assets/s2s.jpg"; // <-- логотип

// общий список пользователей для админ-таблицы / Excel
const USERS_KEY = "skill2skill_users";

function saveUserToLocalList(user) {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const list = raw ? JSON.parse(raw) : [];

    if (!user.email) return;

    const idx = list.findIndex((u) => u.email === user.email);
    const base = {
      ...user,
      createdAt: user.createdAt || new Date().toISOString(),
    };

    let next;
    if (idx >= 0) {
      // обновляем существующую запись
      next = [...list];
      next[idx] = { ...next[idx], ...base };
    } else {
      // добавляем новую
      next = [...list, base];
    }

    localStorage.setItem(USERS_KEY, JSON.stringify(next));
  } catch (e) {
    console.error("Failed to update users list", e);
  }
}

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState({});

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const eobj = {};
    if (!isEmail(form.email)) eobj.email = "Введите корректный email";
    if ((form.password || "").length < 6) eobj.password = "Минимум 6 символов";
    setErr(eobj);
    if (Object.keys(eobj).length) return;

    // основной юзер для логина
    const newUser = { email: form.email, password: form.password, bio: "" };

    // сохраняем в «текущего» пользователя
    saveUser(newUser);

    // добавляем/обновляем запись в общем списке пользователей (для Excel)
    saveUserToLocalList({ email: form.email });

    // редирект на логин, как и раньше
    nav("/login", { state: { email: form.email } });
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        {/* ЛОГО по центру и крупнее */}
        <div className="brand brand-center">
          <img
            className="brand-logo-auth brand-logo-big"
            src={logo}
            alt="Skill2Skill"
            draggable="false"
          />
          <div className="brand-sub">Добро пожаловать!</div>
        </div>

        <h2 className="auth-title">Создать аккаунт</h2>
        <p className="auth-desc">
          Получай помощь в том, что хочешь изучить, и делись тем, что уже
          умеешь.
        </p>

        <form className="auth-form" onSubmit={submit}>
          <label className="input-row">
            <span className="input-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3.5"
                  y="6.5"
                  width="17"
                  height="11"
                  rx="2.2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 7l8 6 8-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </span>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </label>
          {err.email && <div className="error">{err.email}</div>}

          <label className="input-row">
            <span className="input-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect
                  x="5"
                  y="11"
                  width="14"
                  height="9"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 11V8a4 4 0 118 0v3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </span>
            <input
              type="password"
              placeholder="Минимум 6 символов"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </label>
          {err.password && <div className="error">{err.password}</div>}

          <button className="btn btn-primary" type="submit">
            Создать аккаунт
          </button>

          <p className="auth-switch">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </form>
      </div>

      <div className="auth-decor">
        <div className="bubble b1" />
        <div className="bubble b2" />
        <div className="bubble b3" />
      </div>
    </div>
  );
}
