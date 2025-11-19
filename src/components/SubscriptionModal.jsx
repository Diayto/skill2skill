import { useMemo } from "react";
import { getAuth, getPlan, setPlan } from "../lib/storage";

export default function SubscriptionModal({ open, onClose }) {
  if (!open) return null;

  const me = getAuth()?.email || "";
  const current = useMemo(() => (me ? getPlan(me) : "basic"), [me]);

  const choose = (plan) => {
    if (!me) { alert("Сначала войдите в аккаунт"); return; }
    setPlan(me, plan);
    alert(
      plan === "basic" ? "Вы используете Skill2Skill Basic." :
      plan === "plus"  ? "План Skill2Skill Plus активирован!" :
                         "План Skill2Skill Pro активирован!"
    );
    onClose?.();
  };

  const Card = ({ tone, title, subtitle, price, per="/ месяц", features, cta, onClick }) => (
    <div className="card" style={{borderRadius:16, padding:16, height:'100%'}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
        <span className="badge" style={{
          background: tone==='basic' ? '#FFE3DC' : tone==='plus' ? 'linear-gradient(135deg, var(--red), var(--red-dark))' : '#111',
          color: tone==='basic' ? 'var(--black)' : '#fff',
          border: tone==='basic' ? '1px solid #F4C7BB' : 'none'
        }}>
          {tone.toUpperCase()}
        </span>
        {current===tone && <span className="pill">Текущий план</span>}
      </div>

      <h3 style={{margin:'6px 0 2px', color:'var(--black)'}}>{title}</h3>
      <p style={{margin:0, color:'var(--muted)'}}>{subtitle}</p>

      <div className="modal-price" style={{marginTop:10}}>
        <span className="price">{price}</span>
        <span className="per">{per}</span>
      </div>

      <ul className="modal-features" style={{marginTop:8}}>
        {features.map((f,i)=>(
          <li key={i} className={f.yes ? "yes" : "no"} style={{color: f.yes ? 'var(--black)' : 'var(--muted)'}}>
            {f.text}
          </li>
        ))}
      </ul>

      <button
        className="btn btn-primary"
        onClick={onClick}
        style={{width:'100%', marginTop:'auto'}}
        disabled={current===tone}
        title={current===tone ? "Этот план уже активен" : undefined}
      >
        {cta}
      </button>
    </div>
  );

  return (
    <div className="modal-wrap" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      {/* увелили модалку, чтобы поместилось 3 карточки в ряд */}
      <div
        className="modal"
        style={{
          padding:'20px 20px 18px',
          width: 'min(1024px, calc(100% - 32px))'
        }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Закрыть">✕</button>

        <div className="modal-header" style={{marginBottom:8}}>
          <div className="badge">ПОДПИСКА</div>
          <h2 className="modal-title">Выберите план</h2>
          <div className="modal-subtitle">Больше уроков — больше обмена навыками</div>
        </div>

        {/* сетка на 3 колонки; на узких экранах сама схлопнется */}
        <div
          style={{
            display:'grid',
            gridTemplateColumns:'repeat(3, 1fr)',
            gap:16,
            alignItems:'stretch'
          }}
        >
          <Card
            tone="basic"
            title="Skill2Skill Basic"
            subtitle="Учись бесплатно"
            price="$0"
            features={[
              {yes:true,  text:"Дневной лимит уроков: 1"},
              {yes:true,  text:"Доступ к базовым курсам"},
              {yes:false, text:"Приоритет в поиске"},
              {yes:false, text:"Бейдж в профиле"},
              {yes:false, text:"Поддержка"},
            ]}
            cta="Использовать бесплатно"
            onClick={() => choose("basic")}
          />

          <Card
            tone="plus"
            title="Skill2Skill Plus"
            subtitle="Учись и учи больше каждый день"
            price="$9.99"
            features={[
              {yes:true,  text:"Дневной лимит уроков: 3"},
              {yes:true,  text:"Приоритет в поиске и рекомендациях"},
              {yes:true,  text:"Бейдж Plus в профиле"},
              {yes:true,  text:"Поддержка и обновления"},
              {yes:false, text:"Продвинутая аналитика учеников"},
              {yes:false, text:"Безлимитные уроки"},
            ]}
            cta="Купить за $9.99"
            onClick={() => choose("plus")}
          />

          <Card
            tone="pro"
            title="Skill2Skill Pro"
            subtitle="Для активных преподавателей и учеников"
            price="$19.99"
            features={[
              {yes:true,  text:"Безлимитный лимит уроков"},
              {yes:true,  text:"Максимальный приоритет в поиске"},
              {yes:true,  text:"Бейдж Pro"},
              {yes:true,  text:"Продвинутая аналитика курсов"},
              {yes:true,  text:"Ежемесячные промо-бусты профиля"},
              {yes:true,  text:"Поддержка 24/7 и ранний доступ"},
            ]}
            cta="Перейти на Pro"
            onClick={() => choose("pro")}
          />
        </div>

        <div className="modal-actions" style={{marginTop:12}}>
          <div className="modal-note">
            Оплата пока демо.
          </div>
        </div>
      </div>
    </div>
  );
}
