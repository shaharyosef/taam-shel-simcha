import { Link } from "react-router-dom";
import "../css/Navbar.css"; // Make sure the path is correct based on your file structure

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">🍲 טעם של שמחה</div>
      <ul className="navbar-links">
        <li><Link to="/">בית</Link></li>
        <li><Link to="/register">הרשמה</Link></li>
        <li><Link to="/recipes">מתכונים</Link></li>
        <li><Link to="/profile">הפרופיל שלי</Link></li>
        <li><Link to="/login">התחברות</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
