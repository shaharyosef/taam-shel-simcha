import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CreateRecipePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: "",
    instructions: "",
    video_url: "",
    is_public: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      data.append(key, value.toString())
    );
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      await api.post("/recipes/add", data);
      setMessage("🎉 המתכון נוסף בהצלחה!");
      setTimeout(() => navigate("/recipes"), 1000);
    } catch {
      setMessage("😥 שגיאה בהוספת המתכון");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-xl rounded-3xl p-8 border" dir="rtl">
      <h1 className="text-3xl font-bold text-center text-primary mb-6">
        יצירת מתכון חדש
      </h1>

      {message && (
        <div className="text-center text-sm mb-4 text-blue-700 font-medium">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          placeholder="שם המתכון"
          required
          value={formData.title}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-primary"
        />

        <textarea
          name="description"
          placeholder="תיאור קצר"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm h-16 focus:outline-none focus:ring focus:border-primary"
        />

        <textarea
          name="ingredients"
          placeholder="רכיבים (הפרד בפסיקים או לפי שורות)"
          value={formData.ingredients}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm h-20 focus:outline-none focus:ring focus:border-primary"
        />

        <textarea
          name="instructions"
          placeholder="הוראות הכנה"
          value={formData.instructions}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm h-28 focus:outline-none focus:ring focus:border-primary"
        />

        <input
          name="video_url"
          placeholder="קישור לסרטון הכנה (יוטיוב)"
          value={formData.video_url}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-primary"
        />

        {/* שדה העלאת תמונה */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            העלאת תמונה של המתכון (אופציונלי)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 border rounded-lg shadow-sm bg-gray-50"
          />
          {preview && (
            <img
              src={preview}
              alt="תצוגה מקדימה"
              className="mt-3 rounded-lg max-h-64 mx-auto"
            />
          )}
        </div>

        {/* צ'קבוקס פומבי */}
        <div className="flex items-center justify-end flex-row-reverse gap-2 mt-2">
          <input
            type="checkbox"
            checked={formData.is_public}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                is_public: e.target.checked,
              }))
            }
            className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label className="text-sm font-medium text-gray-700">
            מתכון ציבורי
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-hover text-white font-bold py-3 rounded-lg transition"
        >
          {isLoading ? "שולח..." : "שמור מתכון"}
        </button>
      </form>
    </div>
  );
}
