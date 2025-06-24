import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Recipe } from "../types/Recipe";
import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  rateRecipe,
} from "../services/recipeService";
import CommentsSection from "../components/CommentsSection";
import StarRating from "../components/StarRating";
import api from "../services/api";
import YouTubePlayer from "../components/YouTubePlayer";

export default function RecipeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentUser, setCurrentUser] = useState<null | { id: number; is_admin?: boolean }>(null);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const userRes = await api.get("/auth/me");
        setCurrentUser(userRes.data);

        try {
          const privateRes = await api.get(`/recipes/${id}`);
          setRecipe(privateRes.data);
        } catch {
          const publicRes = await api.get(`/recipes/public/${id}`);
          setRecipe(publicRes.data);
        }

      } catch {
        try {
          const publicRes = await api.get(`/recipes/public/${id}`);
          setRecipe(publicRes.data);
        } catch {
          alert("שגיאה בטעינת המתכון");
          navigate("/recipes");
        }
      }
    }

    fetchRecipe();
  }, [id, navigate]);

  useEffect(() => {
    async function checkFavorite() {
      if (!recipe) return;
      const favs = await getFavorites();
      setIsFavorited(favs.includes(recipe.id));
    }
    checkFavorite();
  }, [recipe]);

  const extractVideoId = (url: string): string => {
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&\n?#]+)/);
    return match ? match[1] : "";
  };

  if (!recipe) return <div className="p-6 text-white">טוען מתכון...</div>;
  console.log("🎥 video_url:", recipe.video_url);


  const ingredients = recipe.ingredients?.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
  const instructions = recipe.instructions?.split("\n").filter(Boolean);
  const formattedDate = recipe.created_at
    ? new Date(recipe.created_at).toLocaleString("he-IL", {
        dateStyle: "long",
        timeStyle: "short",
      })
    : "תאריך לא זמין";

  const canEdit = currentUser?.id === recipe.user_id || currentUser?.is_admin;

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
        {canEdit && (
          <div className="absolute top-4 left-4 flex gap-2">
            <Link
              to={`/recipes/${recipe.id}/edit`}
              title="ערוך מתכון"
              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
            >
              ✏️
            </Link>
            <button
              title="מחק מתכון"
              onClick={async () => {
                if (window.confirm("האם אתה בטוח שברצונך למחוק את המתכון?")) {
                  try {
                    await api.delete(`/recipes/${recipe.id}`);
                    alert("המתכון נמחק");
                    navigate("/recipes");
                  } catch {
                    alert("שגיאה במחיקת המתכון");
                  }
                }
              }}
              className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
            >
              🗑️
            </button>
          </div>
        )}

        <Link to="/recipes" className="inline-block mb-6 text-primary hover:underline text-base font-semibold">
          ← חזרה לרשימת המתכונים
        </Link>

        <h1 className="text-4xl font-bold text-primary mb-2">{recipe.title}</h1>

        <div className="flex flex-wrap gap-3 items-center mb-4">
          {recipe.difficulty && (
            <div className={`inline-block font-semibold px-4 py-1 rounded-full text-sm ${difficultyColor}`}>
              🎯 רמת קושי: {difficultyText}
            </div>
          )}
          <div className="inline-block font-semibold px-4 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
            ⭐ {recipe.average_rating != null ? recipe.average_rating.toFixed(1) : "אין דירוג"}
          </div>
          {recipe.prep_time && (
            <div className="inline-block font-semibold px-4 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              🕒 {recipe.prep_time} דק'
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-2">👨‍🍳 {recipe.creator_name}</p>
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

        <button
          onClick={async () => {
            try {
              if (isFavorited) {
                await removeFromFavorites(recipe.id);
                setIsFavorited(false);
              } else {
                await addToFavorites(recipe.id);
                setIsFavorited(true);
              }
            } catch {
              alert("שגיאה בעדכון מועדפים");
            }
          }}
          className={`text-lg mb-10 px-6 py-2 rounded-lg font-bold transition ${
            isFavorited ? "bg-primary text-white hover:bg-hover" : "bg-white text-gray-700 border hover:bg-gray-100"
          }`}
        >
          {isFavorited ? "❤️ הסר מהמועדפים" : "🤍 הוסף למועדפים"}
        </button>

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-primary mb-4">📊 דרג את המתכון</h2>
          <StarRating
            onRate={async (rating) => {
              try {
                await rateRecipe(recipe.id, rating);
                alert("תודה על הדירוג!");
              } catch {
                alert("שגיאה בשליחת הדירוג");
              }
            }}
          />
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

        {recipe.video_url?.trim() && extractVideoId(recipe.video_url) && (
          <div className="mb-10 w-full flex justify-center">
            <div className="w-full max-w-4xl">
              <h2 className="text-xl font-semibold mb-3 text-primary">🎬 סרטון הכנה</h2>
              <YouTubePlayer videoId={extractVideoId(recipe.video_url)} />
            </div>
          </div>
        )}

        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold mb-6 text-primary">💬 תגובות</h2>
          <CommentsSection recipeId={recipe.id} />
        </div>
      </div>
    </div>
  );
}
