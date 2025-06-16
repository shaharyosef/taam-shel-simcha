import { useEffect, useState } from "react";
import { getSortedRecipes, addToFavorites, removeFromFavorites, getFavorites, rateRecipe } from "../services/recipeService";
import { Recipe } from "../types/Recipe";
import StarRating from "../components/StarRating";

const SORT_OPTIONS = [
  { value: "top-rated", label: "📈 הכי מדורגים" },
  { value: "random", label: "🎲 אקראיים" },
  { value: "recent", label: "🆕 הכי חדשים" },
  { value: "favorited", label: "❤️ הכי מועדפים" },
];

export default function AllPublicRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [sort, setSort] = useState("recent");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

useEffect(() => {
  async function fetchFavorites() {
    try {
      const favIds = await getFavorites(); // מחזיר מזהי מתכונים שהמשתמש סימן
      console.log("מועדפים מהשרת:", favIds);
      setFavorites(favIds);
    } catch (err) {
      console.error("שגיאה בטעינת מועדפים:", err);
    }
  }

  fetchFavorites();
}, []);



  useEffect(() => {
    async function fetchRecipes() {
      try {
        const data = await getSortedRecipes(sort);
        setRecipes(data.recipes);
      } catch (err) {
        console.error("שגיאה בטעינת מתכונים:", err);
      }
    }

    fetchRecipes();
  }, [sort]);

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
      {/* כפתור מיון - פינה ימנית עליונה */}
      <div className="flex justify-start">
        <div className="ml-auto relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-hover transition"
          >
            מיין לפי ⏷
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow z-10 text-right">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSort(option.value);
                    setDropdownOpen(false);
                  }}
                  className={`block w-full px-4 py-2 text-sm hover:bg-gray-100 ${
                    sort === option.value ? "font-bold text-primary" : ""
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* כרטיסי מתכונים */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white shadow rounded p-4 relative text-right"
          >
            {/* דירוג */}
            <div className="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-1 rounded-md text-xs font-bold shadow">
              ⭐ {recipe.average_rating !== undefined ? recipe.average_rating.toFixed(1) : "אין דירוג"}
            </div>

            {/* דירוג על ידי המשתמש */}
            <div className="mt-2">
                <StarRating onRate={async (rating) => {
                    try {
                        await rateRecipe(recipe.id, rating);
                        alert("תודה על הדירוג!");
                    } catch (err) {
                        console.error("שגיאה בשליחת דירוג:", err);
                        alert("הייתה שגיאה בשליחת הדירוג.");
                    }
        }} />
    </div>


            {/* כפתור לב */}
            <button
              onClick={() => toggleFavorite(recipe.id)}
              className="absolute top-2 left-2 text-2xl hover:scale-110 transition-transform"
              title="הוסף למועדפים"
            >
              {favorites.includes(recipe.id) ? "❤️" : "🤍"}
            </button>

            {/* תמונה */}
            <img
              src={recipe.image_url?.trim() ? recipe.image_url : "/images/no_pic.png"}
              alt={recipe.title}
              className="w-full h-48 object-contain object-center rounded"
            />

            {/* פרטים */}
            <h3 className="text-lg font-bold mt-2">{recipe.title}</h3>
            <p className="text-sm text-gray-600">👨‍🍳 {recipe.creator_name}</p>
            <p className="text-sm mt-1">📝 {recipe.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
