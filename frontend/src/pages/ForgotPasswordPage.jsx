import { useState } from "react";
import { requestPasswordReset } from "../services/authService";
import "../css/RegisterPage.css";


function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await requestPasswordReset(email);
      setMessage("📨 קישור לאיפוס סיסמה נשלח למייל שלך!");
    } catch (err) {
      console.error("שגיאה בשליחת מייל:", err);
      setError("⚠️ שגיאה בשליחת מייל. ודא שהמייל נכון.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>שכחתי סיסמה</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="הכנס/י את האימייל שלך"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          {message && <p style={{ color: "green" }}>{message}</p>}
          <button type="submit" className="auth-submit-button main-login-button">
  שלח קישור לאיפוס
</button>

        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
