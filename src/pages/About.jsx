// src/pages/About.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function About() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <>
      <Navbar
        search={search}
        onSearch={setSearch}
        onToggleSidebar={() => setOpen(v => !v)}
      />
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <main className="container under-navbar">
        <section className="card about-card">
          <h1 className="about-title">О Skill2Skill</h1>
          <p className="about-lead">
            Skill2Skill — это платформа, где студенты обмениваются часами знаний:
            ты помогаешь в том, что умеешь, и получаешь помощь в том, что хочешь
            изучить.
          </p>

          <div className="about-grid">
            <div>
              <h3>Как это работает</h3>
              <ul className="about-list">
                <li>Создаёшь профиль и заполняешь «Учу» и «Хочу» навыки.</li>
                <li>Через поиск находишь людей с нужными навыками.</li>
                <li>Договариваетесь о созвоне / встрече и проводите занятие.</li>
                <li>За каждый проведённый час получаешь час, который можно
                    потратить на обучение у других.</li>
              </ul>
            </div>

            <div>
              <h3>Зачем это нужно</h3>
              <ul className="about-list">
                <li>Живой опыт от реальных студентов, а не сухие курсы.</li>
                <li>Возможность прокачивать софт-скиллы: объяснение, нетворкинг.</li>
                <li>Экономия денег — ты платишь временем и вниманием.</li>
                <li>Комьюнити людей, которые хотят расти и делиться опытом.</li>
              </ul>
            </div>
          </div>

          <p className="about-note">
            Этот прототип сделан для тестирования идеи внутри университета.
            По мере роста будем добавлять матчинг по расписанию, групповые
            сессии и рейтинг наставников.
          </p>
        </section>
      </main>
    </>
  );
}
