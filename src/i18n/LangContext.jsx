// src/i18n/LangContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const LangContext = createContext(null);

// простейший словарь
const DICT = {
  ru: {
    "nav.home": "Главная",
    "nav.profile": "Профиль",
    "nav.about": "О нас",
    "nav.sub": "Подписка",
    "nav.logout": "Выйти",
    "nav.menu": "Меню",
    "navbar.search": "Поиск людей...",
    "navbar.profileBtn": "Профиль",
  },
  en: {
    "nav.home": "Home",
    "nav.profile": "Profile",
    "nav.about": "About",
    "nav.sub": "Subscription",
    "nav.logout": "Log out",
    "nav.menu": "Menu",
    "navbar.search": "Search people...",
    "navbar.profileBtn": "Profile",
  },
};

const STORAGE_KEY = "skill2skill_lang";

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "ru" || stored === "en" ? stored : "ru";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = (code) => {
    if (code === "ru" || code === "en") {
      setLangState(code);
    }
  };

  const t = (key) => {
    const dict = DICT[lang] || DICT.ru;
    return dict[key] || key;
  };

  const value = { lang, setLang, t };

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useLang must be used inside <LangProvider>");
  }
  return ctx;
}
