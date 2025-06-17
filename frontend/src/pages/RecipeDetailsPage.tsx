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

export default function RecipeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentUser, setCurrentUser] = useState<null | { id: number; is_admin?: boolean }>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get("/auth/me");
        setCurrentUser(res.data);
      } catch {
        setCurrentUser(null);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const res = await api.get(`/recipes/public/${id}`);
        setRecipe(res.data);
      } catch {
        alert("שגיאה בטעינת המתכון");
      }
    }
    fetchRecipe();
  }, [id]);

  useEffect(() => {
    async function checkFavorite() {
      if (!recipe) return;
      const favs = await getFavorites();
      setIsFavorited(favs.includes(recipe.id));
    }
    checkFavorite();
  }, [recipe]);

  if (!recipe) return <div className="p-6 text-white">טוען מתכון...</div>;

  const ingredients = recipe.ingredients?.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
  const instructions = recipe.instructions?.split("\n").filter(Boolean);
  const formattedDate = new Date(recipe.created_at).toLocaleString("he-IL", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const canEdit = currentUser?.id === recipe.user_id || currentUser?.is_admin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfcfb] via-[#f6f1ed] to-[#e8e4de] p-6 font-sans">
      <div
        className="relative max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-10 text-right border border-gray-200"
        dir="rtl"
      >
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

        <Link
          to="/recipes"
          className="inline-block mb-6 text-primary hover:underline text-base font-semibold"
        >
          ← חזרה לרשימת המתכונים
        </Link>

        <h1 className="text-4xl font-bold text-primary mb-2">{recipe.title}</h1>
        <p className="text-sm text-gray-600 mb-2">👨‍🍳 {recipe.creator_name}</p>

        <div className="inline-block bg-yellow-100 text-yellow-700 font-bold px-4 py-1 rounded-full text-sm mb-4">
          ⭐ {recipe.average_rating != null ? recipe.average_rating.toFixed(1) : "אין דירוג"}
        </div>

        <p className="text-sm text-gray-500 mb-6">📅 {formattedDate}</p>

        <img
          src={recipe.image_url?.trim() || "/images/no_pic.png"}
          alt={recipe.title}
          className="w-full max-h-[500px] object-contain rounded-xl mb-8 "
        />

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
          className={`text-lg mb-10 px-6 py-2 rounded-lg font-bold transition ${{
            true: "bg-primary text-white hover:bg-hover",
            false: "bg-white text-gray-700 border hover:bg-gray-100",
          }[isFavorited.toString()]}`}
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
              {ingredients.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">לא צוינו מרכיבים</p>
          )}
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-3 text-primary">👨‍🍳 הוראות הכנה</h2>
          {instructions?.length ? (
            <ol className="list-decimal pr-6 text-gray-800 space-y-2">
              {instructions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          ) : (
            <p className="text-gray-500">לא צוינו הוראות</p>
          )}
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold mb-6 text-primary">💬 תגובות</h2>
          <CommentsSection recipeId={recipe.id} />
        </div>
      </div>
    </div>
  );
}
