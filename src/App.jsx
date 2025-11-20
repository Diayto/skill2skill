// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import About from "./pages/About";
import AdminUsers from "./pages/AdminUsers"; // админ-страница
import { getAuth } from "./lib/storage";

// 🔐 список админ-почт (можно добавить ещё, если нужно)
const ADMIN_EMAILS = ["skill2skilladmin@gmail.com"].map((e) =>
  e.toLowerCase().trim()
);

// Защищённый роут для админки
function AdminRoute({ children }) {
  const auth = getAuth();
  const email = auth?.email?.toLowerCase().trim() || "";

  // не залогинен → на логин
  if (!email) {
    return <Navigate to="/login" replace />;
  }

  // залогинен, но не админ → на домашнюю страницу
  if (!ADMIN_EMAILS.includes(email)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Лэндинг по умолчанию */}
      <Route path="/" element={<Landing />} />

      {/* О нас */}
      <Route path="/about" element={<About />} />

      {/* Аутентификация */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* После входа */}
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/:email" element={<Profile />} />
      <Route path="/chat/:email" element={<Chat />} />

      {/* 🔐 Админ-таблица пользователей / Excel */}
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        }
      />

      {/* Фолбэк на лэндинг */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
