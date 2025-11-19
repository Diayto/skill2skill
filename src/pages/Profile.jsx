import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getAuth, getUser, saveUser,
  rateUser, getAverageRating, getMyScoreFor, logout
} from "../lib/storage";

/* ===== ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ===== */

function Stars({ value=0, onRate, disabled }) {
  const full = Math.round(value);
  return (
    <div className="stars big" role="img" aria-label={`rating ${value} of 5`}>
      {[1,2,3,4,5].map(n=>(
        <button
          key={n}
          type="button"
          className={`star ${n<=full?'filled':''}`}
          onClick={()=>!disabled && onRate?.(n)}
          disabled={disabled}
          title={disabled ? "" : `Поставить ${n}★`}
        >★</button>
      ))}
      <span className="star-num">{value.toFixed(1)}</span>
    </div>
  );
}

function TagEditor({value=[], onChange, placeholder, readOnly}) {
  const [text, setText] = useState("");
  const add = () => {
    const v = text.split(",").map(s=>s.trim()).filter(Boolean);
    if(!v.length) return;
    const next = Array.from(new Set([...(value||[]), ...v]));
    onChange?.(next);
    setText("");
  };
  const remove = (t) => onChange?.((value||[]).filter(x=>x!==t));
  if(readOnly){
    return (
      <div className="tags">
        {(value||[]).length ? value.map(t=> <span key={t} className="tag">{t}</span>) : <span className="muted">—</span>}
      </div>
    );
  }
  return (
    <div className="tag-edit">
      <div className="tags">
        {(value||[]).map(t=>(
          <span key={t} className="tag">
            {t}
            <button type="button" onClick={()=>remove(t)} aria-label="remove">×</button>
          </span>
        ))}
      </div>
      <div className="tag-input-row">
        <input
          value={text}
          onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); add(); } }}
          placeholder={placeholder || "введите и Enter"}
        />
        <button className="btn btn-primary" type="button" onClick={add}>Добавить</button>
      </div>
    </div>
  );
}

/* ================== ПРОФИЛЬ ================== */

export default function Profile(){
  const nav = useNavigate();
  const params = useParams();
  const auth = getAuth();
  const myEmail = auth?.email || "";

  const viewingEmail = params.email || myEmail;
  const isMe = viewingEmail === myEmail;

  // исходные данные
  const initial = getUser(viewingEmail) || {
    email: viewingEmail, photo:"", bio:"", wants:[], offers:[], ratings:[]
  };
  const [user, setUser] = useState(initial);
  useEffect(()=> setUser(getUser(viewingEmail) || initial), [viewingEmail]);

  // рейтинг
  const avg = getAverageRating(viewingEmail);
  const myScore = getMyScoreFor(viewingEmail, myEmail);
  const canRate = !!myEmail && !isMe;

  // аватар
  const fileRef = useRef(null);
  const pickFile = ()=> fileRef.current?.click();
  const onFile = (e)=>{
    const f = e.target.files?.[0]; if(!f) return;
    const reader = new FileReader();
    reader.onload = ()=> setUser(s=>({...s, photo: reader.result}));
    reader.readAsDataURL(f);
  };

  const saveProfile = ()=>{
    saveUser({
      email: user.email,
      photo: user.photo || "",
      bio: user.bio || "",
      wants: user.wants || [],
      offers: user.offers || []
    });
    setUser(getUser(viewingEmail));
  };

  const stats = useMemo(()=>({
    offers: user.offers?.length || 0,
    wants:  user.wants?.length  || 0,
    votes:  (user.ratings||[]).length || 0
  }), [user]);

  return (
    <>
      {/* Красивая обложка */}
      <div className="profile-cover">
        <div className="cover-shape c1"/>
        <div className="cover-shape c2"/>
        <div className="cover-shape c3"/>
      </div>
      {/* Кнопка «Назад» */}
<button
  className="back-btn btn-primary"
  onClick={() => nav(-1)}
  aria-label="Назад"
  title="Назад"
>
  ←
</button>


      <div className="container">
        <div className="profile-shell">
          {/* Шапка профиля */}
          <div className="profile-head card">
            <div className="head-left">
              <div className="avatar-wrap" onClick={()=> isMe && pickFile()}>
                {user.photo
                  ? <img src={user.photo} alt="avatar"/>
                  : <div className="avatar-big">{(viewingEmail[0]||'U').toUpperCase()}</div>}
                {isMe && <div className="avatar-cta">Загрузить фото</div>}
                <input ref={fileRef} type="file" accept="image/*" onChange={onFile} hidden/>
              </div>

              <div className="identity">
                <h2 className="name">{viewingEmail}</h2>
                <div className="bio-line">{user.bio || "Добавьте короткое описание о себе"}</div>
                <div className="stat-chips">
                  <span className="chip"> Хочу: <b>{stats.wants}</b></span>
                  <span className="chip"> Учу: <b>{stats.offers}</b></span>
                  <span className="chip">⭐ Оценок: <b>{stats.votes}</b></span>
                </div>
              </div>
            </div>

            <div className="head-right">
              <Stars
                value={canRate ? (myScore || avg) : avg}
                onRate={(n)=>{ if(canRate){ rateUser(viewingEmail, n, myEmail); setUser({...getUser(viewingEmail)}); } }}
                disabled={!canRate}
              />
              <div className="head-actions">
  {/* Чужой профиль: только кнопка "Написать" */}
  {myEmail && !isMe && (
    <Link
      className="btn btn-primary"
      to={`/chat/${encodeURIComponent(viewingEmail)}`}
    >
      Написать
    </Link>
  )}

  {/* Мой профиль: только "Выйти" */}
  {isMe && (
    <button
      className="btn btn-primary"
      onClick={() => { logout(); nav("/login"); }}
    >
      Выйти
    </button>
  )}

  {/* Гость: "Войти" */}
  {!myEmail && (
    <Link className="btn" to="/login">Войти</Link>
  )}
</div>


            </div>
          </div>

          {/* Контент */}
          <div className="profile-grid">
            <div className="section-card card">
              <h3>О себе</h3>
              {isMe ? (
                <input
                  className="about-input"
                  type="text"
                  maxLength={180}
                  value={user.bio || ""}
                  placeholder="1–2 предложения о себе"
                  onChange={(e)=> setUser(s=>({...s, bio:e.target.value}))}
                />
              ) : (
                <p className="about-text">{user.bio || "—"}</p>
              )}
            </div>

            <div className="section-card card">
              <h3>Хочу изучать</h3>
              <TagEditor
                readOnly={!isMe}
                value={user.wants || []}
                onChange={(v)=> setUser(s=>({...s, wants:v}))}
                placeholder="например: UX/UI, немецкий"
              />
            </div>

            <div className="section-card card">
              <h3>Могу научить</h3>
              <TagEditor
                readOnly={!isMe}
                value={user.offers || []}
                onChange={(v)=> setUser(s=>({...s, offers:v}))}
                placeholder="например: английский, математика"
              />
            </div>
          </div>

          {isMe && (
            <div className="save-row">
              <button className="btn btn-primary" onClick={saveProfile}>Сохранить профиль</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
