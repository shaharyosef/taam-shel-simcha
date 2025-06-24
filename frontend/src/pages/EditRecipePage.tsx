import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Recipe } from "../types/Recipe";
import api from "../services/api";

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<Recipe>>({
    title: "",
    description: "",
    ingredients: "",
    instructions: "",
    image_url: "",
    video_url: "",
    is_public: true,
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const res = await api.get(`/recipes/${id}`);
        setForm(res.data);
      } catch {
        alert("שגיאה בטעינת המתכון");
      }
    }
    fetchRecipe();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "your_upload_preset"); // 👈 שנה לערך שלך
    setUploading(true);

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setForm((prev) => ({ ...prev, image_url: data.secure_url }));
    } catch {
      alert("שגיאה בהעלאת תמונה");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/recipes/${id}`, form);
      alert("המתכון עודכן בהצלחה");
      navigate(`/recipes/${id}`);
    } catch {
      alert("שגיאה בעדכון המתכון");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-xl rounded-3xl p-8 border" dir="rtl">
      <h1 className="text-3xl font-bold text-center text-black mb-6">
        ✏️ עריכת מתכון
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          placeholder="שם המתכון"
          value={form.title || ""}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm"
        />

        <textarea
          name="description"
          placeholder="תיאור קצר"
          value={form.description || ""}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm h-16"
        />

        <textarea
          name="ingredients"
          placeholder="רכיבים (שורה או פסיק לכל רכיב)"
          value={form.ingredients || ""}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm h-20"
        />

        <textarea
          name="instructions"
          placeholder="הוראות הכנה"
          value={form.instructions || ""}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm h-28"
        />

        {/* העלאת קובץ תמונה */}
        <div>
          <label className="block text-sm font-medium mb-1">העלאת תמונה:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-2 border rounded-md"
          />
          {uploading && <p className="text-sm mt-1">⏳ מעלה תמונה...</p>}
          {form.image_url && (
            <img
              src={form.image_url}
              alt="תצוגת תמונה"
              className="mt-2 rounded-lg shadow-md max-h-48"
            />
          )}
        </div>

        <input
          name="video_url"
          placeholder="קישור לסרטון הכנה"
          value={form.video_url || ""}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg shadow-sm"
        />

        <div className="flex items-center justify-end gap-2 mt-2">
          <input
            type="checkbox"
            name="is_public"
            checked={form.is_public ?? true}
            onChange={handleChange}
            className="w-5 h-5"
          />
          <label className="text-sm font-medium text-gray-700">
            הצג כמתכון ציבורי
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-lg"
        >
          שמור שינויים
        </button>
      </form>
    </div>
  );
}
