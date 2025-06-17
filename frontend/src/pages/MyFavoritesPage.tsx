import { useEffect, useState } from "react";
import { getmyFavorites, addToFavorites, removeFromFavorites, rateRecipe } from "../services/recipeService";
import { Recipe } from "../types/Recipe";
import { Link } from "react-router-dom";
import RecipeShareButton from "../components/RecipeShareButton";
import StarRating from "../components/StarRating";

export default function MyFavoritesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data: Recipe[] = await getmyFavorites();
        setRecipes(data);
        setFavorites(data.map((r) => r.id));
      } catch (err) {
        setError("שגיאה בטעינת המועדפים 😥");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleFavorite = async (id: number) => {
    try {
      if (favorites.includes(id)) {
        await removeFromFavorites(id);
        setFavorites(favorites.filter((fid) => fid !== id));
      } else {
        await addToFavorites(id);
        setFavorites([...favorites, id]);
      }
    } catch (err) {
      console.error("שגיאה בניהול מועדפים:", err);
    }
  };

  return (
    <div className="p-4 text-right" dir="rtl">
      <h1 className="text-3xl font-bold text-primary mb-6 text-center"> המועדפים שלי 💖</h1>

      {loading ? (
        <p className="text-center">טוען מתכונים...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : recipes.length === 0 ? (
        <p className="text-center text-gray-600">לא הוספת עדיין מתכונים למועדפים.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recipes.map((recipe) => (
            <Link
              to={`/recipes/${recipe.id}`}
              key={recipe.id}
              className="bg-white shadow rounded p-4 relative text-right hover:shadow-lg transition block"
            >
              {/* דירוג ממוצע */}
              <div className="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-1 rounded-md text-xs font-bold shadow">
                ⭐{" "}
                {recipe.average_rating != null
                  ? recipe.average_rating.toFixed(1)
                  : "אין דירוג"}
              </div>

              {/* כפתורי לב ושיתוף */}
              <div
                onClick={(e) => e.preventDefault()}
                className="absolute top-2 left-2 flex gap-2 items-center z-10"
              >
                <button
                  onClick={() => toggleFavorite(recipe.id)}
                  className="text-2xl hover:scale-110 transition-transform"
                  title="הסר ממועדפים"
                >
                  {favorites.includes(recipe.id) ? "❤️" : "🤍"}
                </button>
                <RecipeShareButton recipeId={recipe.id} title={recipe.title} />
              </div>

              {/* דירוג משתמש */}
              <div onClick={(e) => e.preventDefault()} className="mt-2">
                <StarRating
                  onRate={async (rating) => {
                    try {
                      await rateRecipe(recipe.id, rating);
                      alert("תודה על הדירוג!");
                    } catch (err) {
                      console.error("שגיאה בשליחת דירוג:", err);
                      alert("הייתה שגיאה בשליחת הדירוג.");
                    }
                  }}
                />
              </div>

              {/* תמונה */}
              <img
                src={
                  recipe.image_url?.trim()
                    ? recipe.image_url
                    : "/images/no_pic.png"
                }
                alt={recipe.title}
                className="w-full h-48 object-contain object-center rounded"
              />

              {/* פרטים */}
              <h3 className="text-lg font-bold mt-2">{recipe.title}</h3>
              <p className="text-sm text-gray-600">👨‍🍳 {recipe.creator_name}</p>
              <p className="text-sm mt-1 break-words whitespace-pre-wrap">
                📝 {recipe.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
