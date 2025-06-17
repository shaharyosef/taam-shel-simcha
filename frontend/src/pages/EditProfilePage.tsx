import { useEffect, useState } from "react";
import api from "../services/api";

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    wants_emails: false,
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get("/auth/me");
        setFormData((prev) => ({
          ...prev,
          username: res.data.username,
          wants_emails: res.data.wants_emails || false,
        }));
      } catch {
        setMessage("שגיאה בטעינת המשתמש");
      }
    }
    fetchUser();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage("הסיסמאות לא תואמות");
      return;
    }

    const payload = {
      username: formData.username,
      password: formData.password || undefined,
      wants_emails: formData.wants_emails,
    };

    setLoading(true);
    api
      .put("/auth/profile", payload)
      .then(() => {
        setMessage("🎉 הפרופיל עודכן בהצלחה");
      })
      .catch(() => {
        setMessage("😥 שגיאה בעדכון הפרופיל");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow-xl rounded-3xl p-8 border" dir="rtl">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">עריכת פרופיל</h1>

      {message && <div className="text-center text-sm mb-4 text-blue-700 font-medium">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="שם משתמש חדש"
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none"
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="סיסמה חדשה (לא חובה)"
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none"
        />

        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="אישור סיסמה"
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none"
        />

        <div className="flex items-center justify-end flex-row-reverse gap-2 mt-2">
          <input
            type="checkbox"
            name="wants_emails"
            checked={formData.wants_emails}
            onChange={handleChange}
            className="w-5 h-5 text-primary border-gray-300 rounded"
          />
          <label className="text-sm text-gray-700">לקבל עדכונים למייל</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-hover text-white font-bold py-3 rounded-lg transition"
        >
          {loading ? "שומר..." : "שמור שינויים"}
        </button>
      </form>
    </div>
  );
}
