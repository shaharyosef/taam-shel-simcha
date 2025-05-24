import { Link } from "react-router-dom";
import "../css/GuestNavbar.css";

function GuestNavbar() {
  return (
    <nav className="guest-navbar">
      <div className="guest-navbar-logo"></div>

      <ul className="guest-navbar-links">
        <li>
          <Link to="/public-recipes" className="nav-icon-button">
            <img
              src="/recipe_icon.png"
              alt="מתכונים"
              className="nav-icon-img"
            />
            <span className="nav-icon-label">מתכונים</span>
          </Link>
        </li>

        <li>
          <Link to="/ai-recipe" className="nav-icon-button">
            <img
              src="/recipe_icon_ai.png"
              alt="AI"
              className="nav-icon-img"
            />
            <span className="nav-icon-label"> AI מתכון עם </span>
          </Link>
        </li>

        <li>
          <Link to="/" className="nav-icon-button">
            <img
              src="/login_icon.png"
              alt="התחברות"
              className="nav-icon-img"
            />
            <span className="nav-icon-label">התחברות</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default GuestNavbar;
