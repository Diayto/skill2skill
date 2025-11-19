// src/pages/Landing.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/skill2s.png";

const copy = {
  ru: {
    name: "Skill2Skill",
    tagline: "Платформа для обучения, общения и координации",
    subtitle:
      "Находи людей, которые хотят учиться и делиться навыками: час твоего опыта в обмен на час их знаний.",
    note: "Начни с простой анкеты — платформа подберёт тебе людей по интересам и навыкам.",
    register: "Зарегистрироваться",
    login: "Войти",
  },
  en: {
    name: "Skill2Skill",
    tagline: "Peer-to-peer skill exchange for students",
    subtitle:
      "Find people who want to learn and share skills: one hour of your expertise for one hour of theirs.",
    note: "Start with a short profile — the platform will match you with people by skills and interests.",
    register: "Sign up",
    login: "Log in",
  },
};

export default function Landing() {
  const [lang, setLang] = useState("ru");
  const t = copy[lang];

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-logo">
          <img src={logo} alt="Skill2Skill" className="landing-logo-mark" />
          <span className="landing-logo-text">{t.name}</span>
        </div>

        {/* переключатель RU / EN справа сверху */}
        <div className="landing-lang-switch">
          <button
            type="button"
            className={`landing-lang-btn ${lang === "ru" ? "is-active" : ""}`}
            onClick={() => setLang("ru")}
          >
            RU
          </button>
          <button
            type="button"
            className={`landing-lang-btn ${lang === "en" ? "is-active" : ""}`}
            onClick={() => setLang("en")}
          >
            EN
          </button>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-text">
            <p className="landing-kicker">Платформа обмена навыками</p>
            <h1 className="landing-title">{t.tagline}</h1>
            <p className="landing-subtitle">{t.subtitle}</p>

            {/* только две кнопки: зарегистрироваться и войти */}
            <div className="landing-cta">
              <Link to="/register" className="btn btn-primary landing-cta-main">
                {t.register}
              </Link>
              <Link to="/login" className="btn landing-cta-ghost">
                {t.login}
              </Link>
            </div>

            <p className="landing-note">{t.note}</p>
          </div>

          {/* справа – красивая визуализация обмена навыками */}
          <div className="landing-visual">
            <div className="landing-orbit">
              <div className="landing-orbit-circle landing-orbit-circle-main" />
              <div className="landing-orbit-circle landing-orbit-circle-secondary" />

              <div className="landing-mini-card landing-mini-card-left">
                <p className="mini-title">Тимур · Java → Python</p>
                <p className="mini-body">
                  Помогает с ООП, получает помощь с Python.
                </p>
              </div>

              <div className="landing-mini-card landing-mini-card-right">
                <p className="mini-title">Көркем · English → Design</p>
                <p className="mini-body">
                  Разговорный английский в обмен на советы по Figma.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
