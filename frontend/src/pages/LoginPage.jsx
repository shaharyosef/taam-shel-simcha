import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/LoginPage.css"; // נוודא שהקובץ קיים

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Trying to log in with:", formData);
    // נשלח בהמשך ל־API
  };

  return (
    <div className="login-container">
      <div className="login-card">

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
          <button type="submit" className="login-submit-button" >התחבר</button>
        </form>
        <p className="register-link">
          אין לך חשבון? <a href="/register">להרשמה</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
