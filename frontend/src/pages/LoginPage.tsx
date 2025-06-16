// src/pages/LoginPage.tsx
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // ✅ הוספת useNavigate

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.access_token);
      alert("התחברת בהצלחה!");
      navigate("/recipes"); // ✅ הפנייה אחרי התחברות
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-lg shadow-lg space-y-4 w-full max-w-sm text-center"
      >
        <h2 className="text-2xl font-bold">התחברות</h2>

        <input
          type="email"
          dir="rtl"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-md"
          required
        />
        <input
          type="password"
          dir="rtl"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-md"
          required
        />

        <div className="w-full flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:underline hover:text-hover"
          >
            שכחתי סיסמה
          </Link>
        </div>

        <Button className="w-full bg-primary text-white hover:bg-hover mt-1">
          התחברות
        </Button>

        <div className="mt-2">
          <Link
            to="/register"
            className="text-sm text-primary hover:underline hover:text-hover"
          >
            עדיין אין לך משתמש? הירשם עכשיו
          </Link>
        </div>
      </form>
    </div>
  );
}
