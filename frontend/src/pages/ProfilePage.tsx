import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  wants_emails: boolean;
  profile_image_url: string | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get<User>("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("שגיאה בטעינת פרטי המשתמש:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  if (!user) {
    return <div className="text-center mt-10 text-gray-600">טוען פרופיל...</div>;
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-orange-600">הפרופיל שלי</h2>

      <div className="bg-white shadow p-6 rounded-xl text-right space-y-4" dir="rtl">
        {/* תמונה */}
        <div className="flex justify-center">
          <img
            src={user.profile_image_url || "/images/profileicon.png"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-2 border-orange-300"
          />
        </div>

        {/* פרטים */}
        <div className="text-lg text-gray-700 space-y-2">
          <p><span className="font-bold">שם משתמש:</span> {user.username}</p>
          <p><span className="font-bold">אימייל:</span> {user.email}</p>
          <p>
            <span className="font-bold">תאריך הרשמה:</span>{" "}
            {new Date(user.created_at).toLocaleDateString("he-IL")}
          </p>
          <p>
            <span className="font-bold">מקבל מיילים:</span>{" "}
            {user.wants_emails ? "כן" : "לא"}
          </p>
          {user.is_admin && (
            <p className="text-red-600 font-semibold">🛡️ משתמש אדמין</p>
          )}
        </div>

        {/* כפתור עריכה */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate("/edit-profile")}
            className="bg-primary text-white py-2 px-6 rounded hover:bg-hover font-bold transition"
          >
            ✏️ עריכת פרופיל
          </button>
        </div>
      </div>
    </div>
  );
}
