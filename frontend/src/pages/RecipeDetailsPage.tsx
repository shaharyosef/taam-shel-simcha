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
    <div className="min-h-screen bg-gradient-to-br from-[#fff4e6] via-[#fff0e0] to-[#ffe8dc] p-6 font-sans">
      <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 transition-all duration-500 text-right border border-orange-200" dir="rtl">

        <Link
          to="/recipes"
          className="inline-block mb-8 text-orange-600 hover:underline text-base font-semibold hover:text-orange-800 transition-all"
        >
          ← חזרה לרשימת המתכונים
        </Link>

        <h1 className="text-5xl font-extrabold mb-2 text-orange-800 drop-shadow-lg animate-fadeIn">
          {recipe.title}
        </h1>

        <p className="text-sm text-gray-600 mb-3">👨‍🍳 {recipe.creator_name}</p>

        <div className="inline-block bg-yellow-100 text-yellow-700 font-bold px-4 py-1 rounded-full text-sm mb-4 shadow-sm">
          ⭐ {recipe.average_rating != null ? recipe.average_rating.toFixed(1) : "אין דירוג"}
        </div>

        <p className="text-sm text-gray-500 mb-6">📅 {formattedDate}</p>

        <img
          src={recipe.image_url?.trim() || "/images/no_pic.png"}
          alt={recipe.title}
          className="w-full max-h-[500px] object-contain object-center rounded-2xl mb-10 transition-transform duration-500 hover:scale-105"
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
          className={`text-xl mb-10 px-6 py-3 rounded-xl shadow-md font-bold transition-colors duration-300 ${
            isFavorited
              ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
              : 'bg-white text-gray-700 hover:bg-orange-100 hover:text-orange-600'
          }`}
        >
          {isFavorited ? "❤️ הסר מהמועדפים" : "🤍 הוסף למועדפים"}
        </button>

        <div className="my-10">
          <h2 className="text-3xl font-bold text-orange-700 mb-4">📊 דרג את המתכון</h2>
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
          <h2 className="text-2xl font-bold mb-3 text-orange-700">🧂 מרכיבים</h2>
          {ingredients?.length ? (
            <ul className="list-disc pr-6 text-gray-800 space-y-2 text-base">
              {ingredients.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-base text-gray-500">לא צוינו מרכיבים</p>
          )}
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-3 text-orange-700">👨‍🍳 הוראות הכנה</h2>
          {instructions?.length ? (
            <ol className="list-decimal pr-6 text-gray-800 space-y-2 text-base">
              {instructions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          ) : (
            <p className="text-base text-gray-500">לא צוינו הוראות</p>
          )}
        </div>

        <div className="mt-12 border-t border-orange-200 pt-8">
          <h2 className="text-3xl font-extrabold mb-6 text-orange-800">💬 תגובות</h2>
          <CommentsSection recipeId={recipe.id} />
        </div>
      </div>
    </div>
  );
}
