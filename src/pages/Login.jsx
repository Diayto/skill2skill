// src/pages/Login.jsx
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { saveUser, setAuth } from "../lib/storage";
import { isEmail } from "../lib/validators";
import logo from "../assets/s2s.jpg";

// 🔥 Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { upsertRemoteUser } from "../lib/usersRemote";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState({});

  useEffect(() => {
    const pre = loc.state?.email;
    if (pre) setForm((s) => ({ ...s, email: pre }));
  }, [loc.state]);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const eobj = {};

    if (!isEmail(form.email)) eobj.email = "Неверный email";
    if (!form.password) eobj.password = "Введите пароль";

    setErr(eobj);
    if (Object.keys(eobj).length) return;

    try {
      // 🔐 Вход через Firebase Auth
      const cred = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const email = cred.user.email;

      // ✅ гарантируем, что есть локальный профиль (для Home / Profile / Chat)
      saveUser({
        email,
        bio: "",
        wants: [],
        offers: [],
      });

      // ✅ синхронизируем пользователя в Firestore (главная база)
      try {
        await upsertRemoteUser(email, {
          email,
        });
      } catch (e) {
        console.warn("upsertRemoteUser (login) failed:", e);
      }

      // ✅ сохраняем "сессию" в localStorage
      setAuth(email);

      nav("/home");
    } catch (error) {
      console.error(error);

      let msg = "Ошибка входа. Попробуйте ещё раз.";
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        msg = "Неверный email или пароль";
      } else if (error.code === "auth/invalid-email") {
        eobj.email = "Некорректный email";
      }

      setErr((prev) => ({ ...prev, password: msg, ...eobj }));
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand brand-center">
          <img
            className="brand-logo-auth brand-logo-big"
            src={logo}
            alt="Skill2Skill"
            draggable="false"
          />
          <div className="brand-sub">С возвращением!</div>
        </div>

        <h2 className="auth-title">Войти</h2>

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
              placeholder="Ваш пароль"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </label>
          {err.password && <div className="error">{err.password}</div>}

          <button className="btn btn-primary" type="submit">
            Войти
          </button>

          <p className="auth-switch">
            Нет аккаунта? <Link to="/register">Создать</Link>
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
