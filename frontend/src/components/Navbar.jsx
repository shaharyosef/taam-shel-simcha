import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
    setTimeout(() => logout(), 100);
  };

  if (!user) return null;

  return (
    <nav className="guest-navbar">
      <div className="guest-navbar-logo"></div>

      <ul className="guest-navbar-links">
        <li>
          <Link to="/recipes" className="nav-icon-button">
            <img src="/recipe_icon.png" alt="מתכונים" className="nav-icon-img" />
            <span className="nav-icon-label">מתכונים</span>
          </Link>
        </li>

        <li>
          <Link to="/ai-recipe" className="nav-icon-button">
            <img src="/recipe_icon_ai.png" alt="AI" className="nav-icon-img" />
            <span className="nav-icon-label">AI מתכון עם</span>
          </Link>
        </li>

        <li>
          <Link to="/profile" className="nav-icon-button">
            <img src="/login_icon.png" alt="פרופיל" className="nav-icon-img" />
            <span className="nav-icon-label">הפרופיל שלי</span>
          </Link>
        </li>

        <li>
          <button onClick={handleLogout} className="nav-icon-button logout-button">
            <img src="/logout_icon.png" alt="התנתקות" className="nav-icon-img" />
            <span className="nav-icon-label">התנתקות</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
