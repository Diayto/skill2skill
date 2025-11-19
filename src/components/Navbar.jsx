// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import logo from "../assets/skill2s.png";
import { useLang } from "../i18n/LangContext";

export default function Navbar({ search, onSearch, onToggleSidebar }) {
  const { t } = useLang();

  const handleSearchChange = (e) => {
    onSearch?.(e.target.value);
  };

  return (
    <header className="navbar">
      <button
        className="burger"
        onClick={onToggleSidebar}
        aria-label={t("nav.menu")}
        type="button"
      >
        ☰
      </button>

      {/* лого-переход на главную */}
      <Link to="/home" className="brand-slot" aria-label="Skill2Skill">
        <img
          className="brand-mark"
          src={logo}
          alt="Skill2Skill"
          draggable="false"
        />
      </Link>

      <input
        className="search"
        value={search}
        onChange={handleSearchChange}
        placeholder={t("navbar.search")}
      />

      <Link to="/profile" className="btn btn-primary profile-btn">
        {t("navbar.profileBtn")}
      </Link>
    </header>
  );
}
