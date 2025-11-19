import { Link } from "react-router-dom";
import { getAverageRating } from "../lib/storage";

function StarsDisplay({ value }) {
  const full = Math.round(value);
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
  const avg = getAverageRating(user);
  const hasRating = avg > 0;

  const displayName =
    user.fullName ||
    user.name ||
    (user.email ? user.email.split("@")[0] : "Без имени");

  const offersText = user.offers?.length
    ? user.offers.slice(0, 3).join(", ")
    : null;
  const wantsText = user.wants?.length
    ? user.wants.slice(0, 3).join(", ")
    : null;

  return (
    <div className="user-card">
      {user.photo ? (
        <img className="avatar-img" src={user.photo} alt="avatar" />
      ) : (
        <div className="avatar">
          {user.email ? user.email[0].toUpperCase() : "?"}
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
            <div className="uc-email">{user.email}</div>
          </div>

          <div className="uc-rating">
            {hasRating ? (
              <>
                <StarsDisplay value={avg} />
                <span className="star-num">
                  {Number(avg).toFixed ? Number(avg).toFixed(1) : avg}
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
            to={`/profile/${encodeURIComponent(user.email)}`}
            className="btn-ghost"
          >
            Профиль
          </Link>
          <Link
            to={`/chat/${encodeURIComponent(user.email)}`}
            className="btn-mini"
          >
            Написать
          </Link>
        </div>
      </div>
    </div>
  );
}
