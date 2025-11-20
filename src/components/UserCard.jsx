import { Link } from "react-router-dom";
import { getAverageRating } from "../lib/storage";

function StarsDisplay({ value }) {
  const full = Math.round(value || 0);
  return (
    <span className="stars small" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`star ${n <= full ? "filled" : ""}`}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function UserCard({ user }) {
  // безопасно считаем рейтинг даже если прилетел «сырой» объект из Firestore
  const avg = getAverageRating(user);
  const hasRating = avg > 0;

  const email = user.email || "";
  const displayName =
    user.fullName ||
    user.name ||
    (email ? email.split("@")[0] : "Без имени");

  const offers = Array.isArray(user.offers) ? user.offers : [];
  const wants = Array.isArray(user.wants) ? user.wants : [];

  const offersText = offers.length ? offers.slice(0, 3).join(", ") : null;
  const wantsText = wants.length ? wants.slice(0, 3).join(", ") : null;

  return (
    <div className="user-card">
      {user.photo ? (
        <img className="avatar-img" src={user.photo} alt={displayName} />
      ) : (
        <div className="avatar">
          {email ? email[0].toUpperCase() : "?"}
        </div>
      )}

      <div className="uc-main">
        {/* верхняя строка: имя/роль/почта + рейтинг */}
        <div className="uc-row">
          <div>
            <div className="uc-name">{displayName}</div>
            <div className="uc-role">
              {user.bio || "Пока без описания профиля"}
            </div>
            <div className="uc-email">{email}</div>
          </div>

          <div className="uc-rating">
            {hasRating ? (
              <>
                <StarsDisplay value={avg} />
                <span className="star-num">
                  {Number.isFinite(avg) ? avg.toFixed(1) : avg}
                </span>
              </>
            ) : (
              <span className="uc-no-rating">Нет оценок</span>
            )}
          </div>
        </div>

        {/* Учу / Хочу */}
        <div className="uc-skills">
          {offersText && (
            <div>
              <span className="uc-label">Учу:</span> {offersText}
            </div>
          )}
          {wantsText && (
            <div>
              <span className="uc-label">Хочу:</span> {wantsText}
            </div>
          )}
        </div>

        {/* действия по карточке */}
        <div className="uc-actions">
          <Link
            to={`/profile/${encodeURIComponent(email)}`}
            className="btn-ghost"
          >
            Профиль
          </Link>
          <Link
            to={`/chat/${encodeURIComponent(email)}`}
            className="btn-mini"
          >
            Написать
          </Link>
        </div>
      </div>
    </div>
  );
}
