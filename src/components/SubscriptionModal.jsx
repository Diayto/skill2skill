import { useMemo } from "react";
import { getAuth, getPlan, setPlan } from "../lib/storage";

export default function SubscriptionModal({ open, onClose }) {
  if (!open) return null;

  const me = getAuth()?.email || "";

  const current = useMemo(
    () => (me ? getPlan(me) : "basic"),
    [me]
  );

  const choose = (plan) => {
    if (!me) {
      alert("Сначала войдите в аккаунт");
      return;
    }
    setPlan(me, plan);
    alert(
      plan === "basic"
        ? "Вы используете Skill2Skill Basic."
        : plan === "plus"
        ? "План Skill2Skill Plus активирован!"
        : "План Skill2Skill Pro активирован!"
    );
    onClose?.();
  };

  const Card = ({
    tone,
    title,
    subtitle,
    price,
    per = "/ месяц",
    features,
    cta,
    onClick,
  }) => {
    const isCurrent = current === tone;

    const badgeClass =
      tone === "basic"
        ? "plan-badge plan-badge--basic"
        : tone === "plus"
        ? "plan-badge plan-badge--plus"
        : "plan-badge plan-badge--pro";

    return (
      <div className={`plan-card ${isCurrent ? "plan-card--current" : ""}`}>
        <span className={badgeClass}>{tone.toUpperCase()}</span>
        {isCurrent && <div className="pill" style={{ marginLeft: 8 }}>Текущий план</div>}

        <h3 className="plan-title">{title}</h3>
        <p className="plan-sub">{subtitle}</p>

        <div className="plan-price">
          <span className="amount">{price}</span>
          <span className="per">{per}</span>
        </div>

        <ul className="modal-features">
          {features.map((f, i) => (
            <li key={i} className={f.yes ? "yes" : "no"}>
              {f.text}
            </li>
          ))}
        </ul>

        <div className="plan-cta">
          <button
            className="btn btn-primary"
            onClick={onClick}
            disabled={isCurrent}
            title={isCurrent ? "Этот план уже активен" : undefined}
          >
            {cta}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-wrap" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal modal-sub">
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ✕
        </button>

        <div className="modal-header">
          <div className="badge">ПОДПИСКА</div>
          <h2 className="modal-title">Выберите план</h2>
          <div className="modal-subtitle">
            Больше уроков — больше обмена навыками
          </div>
        </div>

        <div className="plans-grid">
          <Card
            tone="basic"
            title="Skill2Skill Basic"
            subtitle="Учись бесплатно"
            price="$0"
            features={[
              { yes: true, text: "Дневной лимит уроков: 1" },
              { yes: true, text: "Доступ к базовым урокам" },
              { yes: false, text: "Приоритет в поиске" },
              { yes: false, text: "Бейдж в профиле" },
              { yes: false, text: "Поддержка" },
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
              { yes: true, text: "Дневной лимит уроков: 3" },
              { yes: true, text: "Приоритет в поиске и рекомендациях" },
              { yes: true, text: "Бейдж Plus в профиле" },
              { yes: true, text: "Поддержка и обновления" },
              { yes: false, text: "Расширенная аналитика учеников" },
              { yes: false, text: "Безлимитные уроки" },
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
              { yes: true, text: "Безлимитный лимит уроков" },
              { yes: true, text: "Максимальный приоритет в поиске" },
              { yes: true, text: "Бейдж Pro" },
              { yes: true, text: "Продвинутая аналитика курсов" },
              { yes: true, text: "Ежемесячные промо-бусты профиля" },
              { yes: true, text: "Поддержка 24/7 и ранний доступ" },
            ]}
            cta="Перейти на Pro"
            onClick={() => choose("pro")}
          />
        </div>

        <div className="modal-actions">
          <div className="modal-note">Оплата пока демо.</div>
        </div>
      </div>
    </div>
  );
}
