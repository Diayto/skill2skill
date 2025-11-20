// src/components/Sidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout, getAuth } from "../lib/storage";
import { useLang } from "../i18n/LangContext";

function Icon({ type }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none" };

  if (type === "home") {
    return (
      <svg {...common}>
        <path
          d="M5 11L12 4l7 7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 10.5V19h11v-8.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "profile") {
    return (
      <svg {...common}>
        <circle
          cx="12"
          cy="9"
          r="3.2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M6.5 19c1.2-2.2 3.1-3.5 5.5-3.5 2.4 0 4.3 1.3 5.5 3.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "sub") {
    return (
      <svg {...common}>
        <rect
          x="4.5"
          y="5.5"
          width="15"
          height="13"
          rx="2.2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M8 10h8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M8 13h4.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "about") {
    return (
      <svg {...common}>
        <circle
          cx="12"
          cy="12"
          r="8"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="12" cy="9" r="1" fill="currentColor" />
        <path
          d="M11.2 12.3H12v4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "admin") {
    return (
      <svg {...common}>
        <rect
          x="4"
          y="5"
          width="16"
          height="14"
          rx="2.2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M8 11h8M8 14h4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // logout
  return (
    <svg {...common}>
      <path
        d="M10 5H7.8C6.26 5 5 6.26 5 7.8v8.4C5 17.74 6.26 19 7.8 19H10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14 8l3 4-3 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 12H10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NavItem({ to, label, icon, active, onClick }) {
  return (
    <Link
      to={to}
      className={`side-link ${active ? "is-active" : ""}`}
      onClick={onClick}
    >
      <span className="side-link-icon">
        <Icon type={icon} />
      </span>
      <span className="side-link-label">{label}</span>
    </Link>
  );
}

// 🔐 список админ-почт (тот же, что и в App.jsx)
const ADMIN_EMAILS = ["skill2skilladmin@gmail.com"].map((e) =>
  e.toLowerCase().trim()
);

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const nav = useNavigate();
  const { lang, setLang, t } = useLang();

  const me = getAuth()?.email?.toLowerCase().trim() || "";
  const isAdmin = ADMIN_EMAILS.includes(me);

  const handleLogout = () => {
    logout();
    onClose?.();
    nav("/login");
  };

  return (
    <>
      {open && <div className="backdrop" onClick={onClose} />}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <header className="sidebar-header">
          <span className="sidebar-menu-title">{t("nav.menu")}</span>
          <button className="sidebar-close" onClick={onClose}>
            ×
          </button>
        </header>

        <nav className="side-links">
          <NavItem
            to="/home"
            icon="home"
            label={t("nav.home")}
            active={location.pathname === "/home"}
            onClick={onClose}
          />
          <NavItem
            to="/profile"
            icon="profile"
            label={t("nav.profile")}
            active={
              location.pathname.startsWith("/profile") &&
              !location.search.includes("section=sub")
            }
            onClick={onClose}
          />
          <NavItem
            to="/about"
            icon="about"
            label={t("nav.about")}
            active={location.pathname === "/about"}
            onClick={onClose}
          />
          <NavItem
            to="/profile?section=sub"
            icon="sub"
            label={t("nav.sub")}
            active={
              location.pathname.startsWith("/profile") &&
              location.search.includes("section=sub")
            }
            onClick={onClose}
          />

          {/* 🔐 Пункт меню только для админов */}
          {isAdmin && (
            <NavItem
              to="/admin/users"
              icon="admin"
              label="Админ-панель"
              active={location.pathname.startsWith("/admin")}
              onClick={onClose}
            />
          )}
        </nav>

        <div className="sidebar-footer">
          <button
            className="side-link-btn side-link-logout"
            onClick={handleLogout}
          >
            <span className="side-link-icon">
              <Icon type="logout" />
            </span>
            <span className="side-link-label">{t("nav.logout")}</span>
          </button>

          <div className="sidebar-footnote">
            beta · студенческий проект Skill2Skill
          </div>

          <div className="sidebar-lang">
            <div className="landing-lang-switch">
              <button
                type="button"
                className={`landing-lang-btn ${
                  lang === "ru" ? "is-active" : ""
                }`}
                onClick={() => setLang("ru")}
              >
                RU
              </button>
              <button
                type="button"
                className={`landing-lang-btn ${
                  lang === "en" ? "is-active" : ""
                }`}
                onClick={() => setLang("en")}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
