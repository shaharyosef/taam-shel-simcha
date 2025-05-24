import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import "../css/LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await loginUser(formData.email, formData.password);
      login({ id: res.user_id, email: formData.email }, res.access_token);
      navigate("/recipes");
    } catch {
      setError("אימייל או סיסמה שגויים.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>התחברות</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="אימייל"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="סיסמה"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && <p className="error">{error}</p>}

          {/* 🔵 כפתור התחברות ראשי */}
          <button type="submit" className="main-login-button">התחבר</button>

          {/* 🔸 שני כפתורים קטנים מתחת */}
          <div className="login-sub-buttons">
            <button
              type="button"
              className="sub-button"
              onClick={() => navigate("/register")}
            >
              הרשמה
            </button>
            <button
              type="button"
              className="sub-button"
              onClick={() => navigate("/forgot-password")}
            >
              שכחתי סיסמה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
