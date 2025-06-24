import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { Recipe } from "../types/Recipe";
import YouTubePlayer from "../components/YouTubePlayer";


export default function GuestRecipePage() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (id) {
      fetchRecipe(id);
    }
  }, [id]);

  const fetchRecipe = async (id: string) => {
    try {
      const res = await api.get(`/recipes/public/${id}`);
      setRecipe(res.data);
    } catch {
      console.error("שגיאה בטעינת מתכון");
    }
  };

  if (!recipe) return <div className="p-6 text-gray-500">טוען מתכון...</div>;

  const ingredients = recipe.ingredients?.split(/[\n,]+/).map(i => i.trim()).filter(Boolean);
  const instructions = recipe.instructions?.split("\n").filter(Boolean);
  const formattedDate = recipe.created_at
    ? new Date(recipe.created_at).toLocaleString("he-IL", {
        dateStyle: "long",
        timeStyle: "short",
      })
    : "";


    function extractYouTubeId(url: string) {
    const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : "";
    }

    
  const difficultyColor = {
    Easy: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Hard: "bg-red-100 text-red-800",
  }[recipe.difficulty || ""] || "bg-gray-100 text-gray-800";

  const difficultyText = {
    Easy: "קל",
    Medium: "בינוני",
    Hard: "קשה",
  }[recipe.difficulty || ""] || recipe.difficulty;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfcfb] via-[#f6f1ed] to-[#e8e4de] p-6 font-sans">
      <div className="relative max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-10 text-right border border-gray-200" dir="rtl">

        <Link to="/" className="inline-block mb-6 text-primary hover:underline text-base font-semibold">
          ← חזרה לדף הבית
        </Link>

        <h1 className="text-4xl font-bold text-primary mb-2">{recipe.title}</h1>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {recipe.difficulty && (
            <div className={`font-semibold px-4 py-1 rounded-full text-sm ${difficultyColor}`}>
              🎯 רמת קושי: {difficultyText}
            </div>
          )}
          {recipe.prep_time && (
            <div className="font-semibold px-4 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              🕒 זמן הכנה: {recipe.prep_time}
            </div>
          )}
          <div className="inline-block bg-yellow-100 text-yellow-700 font-bold px-4 py-1 rounded-full text-sm">
            ⭐ {recipe.average_rating != null ? recipe.average_rating.toFixed(1) : "אין דירוג"}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-2" >👨‍🍳 {recipe.creator_name}</p>
        <p className="text-sm text-gray-500 mb-6">📅 {formattedDate}</p>

        <div className="bg-orange-100 rounded-xl overflow-hidden flex justify-center items-center mb-8 w-full h-[500px]">
          {recipe.image_url?.trim() ? (
            <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-contain" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 1.11.3 2.14.82 3.03L6 15v3a2 2 0 002 2h8a2 2 0 002-2v-3l.18-.97A6.964 6.964 0 0019 9c0-3.87-3.13-7-7-7z" />
              </svg>
            </div>
          )}
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-3 text-primary">🧂 מרכיבים</h2>
          {ingredients?.length ? (
            <ul className="list-disc pr-6 text-gray-800 space-y-2">
              {ingredients.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
          ) : (
            <p className="text-gray-500">לא צוינו מרכיבים</p>
          )}
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-3 text-primary">👨‍🍳 הוראות הכנה</h2>
          {instructions?.length ? (
            <ol className="list-decimal pr-6 text-gray-800 space-y-2">
              {instructions.map((step, idx) => <li key={idx}>{step}</li>)}
            </ol>
          ) : (
            <p className="text-gray-500">לא צוינו הוראות</p>
          )}
        </div>

        {recipe.video_url && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-3 text-primary">🎬 סרטון הכנה</h2>
            <YouTubePlayer videoId={extractYouTubeId(recipe.video_url)} />
          </div>
        )}
      </div>
    </div>
  );
}
