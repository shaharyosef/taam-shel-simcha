import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Recipe } from "../types/Recipe";
import {
  getAllPublicRecipes,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  rateRecipe,
} from "../services/recipeService";
import CommentsSection from "../components/CommentsSection";
import StarRating from "../components/StarRating";

export default function RecipeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    async function fetch() {
      const all = await getAllPublicRecipes();
      const match = all.find((r: Recipe) => r.id === Number(id));
      setRecipe(match || null);
    }

    fetch();
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

  const ingredients = recipe.ingredients?.split("\n").filter(Boolean);
  const instructions = recipe.instructions?.split("\n").filter(Boolean);
  const formattedDate = new Date(recipe.created_at).toLocaleString("he-IL", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff0e5] via-[#ffe4e1] to-[#fff0e5] animate-gradient p-4">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-lg rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.15)] p-8 transition-all duration-500 text-right" dir="rtl">
        <Link
          to="/recipes"
          className="inline-block mb-6 text-blue-600 hover:underline text-sm"
        >
          ← חזרה לרשימת המתכונים
        </Link>

        <h1 className="text-4xl font-extrabold mb-1 text-gray-800 animate-fadeIn">
          {recipe.title}
        </h1>
        <p className="text-sm text-gray-500 mb-3">👨‍🍳 {recipe.creator_name}</p>

        <div className="inline-block bg-yellow-200 text-yellow-800 font-semibold px-4 py-1 rounded-full text-sm mb-3 shadow-sm">
          ⭐ {recipe.average_rating != null ? recipe.average_rating.toFixed(1) : "אין דירוג"}
        </div>

        <p className="text-sm text-gray-400 mb-6">📅 {formattedDate}</p>

        <img
          src={recipe.image_url?.trim() || "/images/no_pic.png"}
          alt={recipe.title}
          className="w-full max-h-[400px] object-cover rounded-xl shadow-md mb-8 hover:scale-105 transition-transform duration-300"
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
          className="text-xl mb-6 hover:scale-105 transition-transform duration-200 bg-white/60 px-4 py-2 rounded-xl shadow hover:bg-red-100"
        >
          {isFavorited ? "❤️ הסר מהמועדפים" : "🤍 הוסף למועדפים"}
        </button>

        <div className="my-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            📊 דרג את המתכון
          </h2>
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

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">
            🧂 מרכיבים
          </h2>
          {ingredients?.length ? (
            <ul className="list-disc pr-5 text-gray-700 space-y-1 text-sm">
              {ingredients.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">לא צוינו מרכיבים</p>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">
            👨‍🍳 הוראות הכנה
          </h2>
          {instructions?.length ? (
            <ol className="list-decimal pr-5 text-gray-700 space-y-1 text-sm break-words max-w-full">
              {instructions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-gray-400">לא צוינו הוראות</p>
          )}
        </div>

        <div className="mt-10 border-t pt-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">💬 תגובות</h2>
          <CommentsSection recipeId={recipe.id} />
        </div>
      </div>
    </div>
  );
}
