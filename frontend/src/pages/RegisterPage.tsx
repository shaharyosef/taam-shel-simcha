import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useState } from "react";
import axios from "axios";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [wantsEmails, setWantsEmails] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("הסיסמאות לא תואמות");
      return;
    }

    try {
      setError("");

      const response = await axios.post("http://localhost:8000/auth/signup", {
        username,
        email,
        password,
        wants_emails: wantsEmails,
      });

      console.log("נרשמת בהצלחה:", response.data);
      navigate("/login");
    } catch (err: any) {
      const message =
        err.response?.data?.detail || "אירעה שגיאה בעת ההרשמה";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-white p-6 rounded-lg shadow-lg space-y-4 w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold">הרשמה</h2>
        <form onSubmit={handleSubmit} className="space-y-3 text-right" dir="rtl">
          <input
            type="text"
            placeholder="שם משתמש"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="password"
            placeholder="אישור סיסמה"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          />

          <div className="flex flex-row-reverse items-center justify-end gap-2 text-sm">
            <label htmlFor="wantsEmails">לקבל מיילים ועדכונים</label>
            <input
              id="wantsEmails"
              type="checkbox"
              checked={wantsEmails}
              onChange={(e) => setWantsEmails(e.target.checked)}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" className="w-full bg-primary text-white hover:bg-hover">
            הרשמה
          </Button>
        </form>

        <p className="text-sm text-gray-600 mt-2">
          כבר יש לך חשבון?{" "}
          <Link to="/login" className="text-primary underline">
            התחבר כאן
          </Link>
        </p>
      </div>
    </div>
  );
}
