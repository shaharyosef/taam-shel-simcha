import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import logo from "../assets/savtaicon.png";
import { User } from "../types/user";  // טיפוס שהגדרת

export default function UserNavbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);  // 👈 השינוי הקריטי

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    api.get("/auth/me")
      .then((res) => setCurrentUser(res.data))
      .catch(() => setCurrentUser(null));
  }, []);

  return (
    <header className="bg-primary text-white shadow-md w-full z-50 relative">
      <div className="w-full px-4 py-3 flex flex-row-reverse items-center justify-between">
        {/* לוגו + שם מימין */}
        <Link to="/recipes" className="flex items-center gap-2">
          <span className="text-xl font-bold hidden sm:inline">טעם של שמחה</span>
          <img
            src={logo}
            alt="לוגו טעם של שמחה"
            className="h-10 w-10 rounded-full object-cover shadow-md"
          />
        </Link>

        {/* ניווט משמאל */}
        <nav className="flex gap-3 items-center">
          <Link
            to="/recipes"
            className="px-4 py-2 rounded-md transition-colors bg-primary hover:bg-hover text-white text-sm font-medium shadow"
          >
            🍽️ מתכונים
          </Link>

          <Link
            to="/recipes/ai"
            className="px-4 py-2 rounded-md transition-colors bg-primary hover:bg-hover text-white text-sm font-medium shadow"
          >
            🤖 AI מתכונים עם
          </Link>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="px-4 py-2 rounded-md transition-colors bg-primary hover:bg-hover text-white text-sm font-medium shadow"
            >
              👤 פרופיל
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-44 bg-white text-black border rounded shadow z-10 text-right">
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                  👤 הפרופיל שלי
                </Link>
                
                <Link to="/recipes/mine" className="block px-4 py-2 hover:bg-gray-100">
                  🍲 המתכונים שלי
                </Link>
                <Link to="/favorites" className="block px-4 py-2 hover:bg-gray-100">
                  ❤️ המועדפים שלי
                </Link>
                {currentUser?.is_admin && (
                  <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100">
                    🔐 ניהול מערכת
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-right px-4 py-2 hover:bg-gray-100"
                >
                  🚪 התנתקות
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
