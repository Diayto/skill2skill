// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import About from "./pages/About";
import AdminUsers from "./pages/AdminUsers"; // 👈 админ-страница

export default function App() {
  return (
    <Routes>
      {/* Главная страница-презентация */}
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

      {/* Админ-таблица пользователей / Excel */}
      <Route path="/admin/users" element={<AdminUsers />} />

      {/* Фолбэк на главную */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
