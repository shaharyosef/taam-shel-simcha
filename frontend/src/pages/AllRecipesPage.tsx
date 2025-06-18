import { useEffect, useState } from "react";
import {
  getSortedRecipes,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  rateRecipe,
  searchRecipes,
} from "../services/recipeService";
import { Recipe } from "../types/Recipe";
import { Link, useNavigate } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";

const SORT_OPTIONS = [
  { value: "top-rated", label: "📈 הכי מדורגים" },
  { value: "random", label: "🎲 אקראיים" },
  { value: "recent", label: "🆕 הכי חדשים" },
  { value: "favorited", label: "❤️ הכי מועדפים" },
];

export default function AllPublicRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [sort, setSort] = useState("recent");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const [searchTitle, setSearchTitle] = useState("");
  const [searchIngredient, setSearchIngredient] = useState("");
  const [searchCreator, setSearchCreator] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const favIds = await getFavorites();
        setFavorites(favIds);
      } catch (err) {
        console.error("שגיאה בטעינת מועדפים:", err);
      }
    }

    fetchFavorites();
  }, []);

  useEffect(() => {
    if (!isSearchMode) fetchRecipes();
  }, [sort]);

  const fetchRecipes = async () => {
    try {
      const data = await getSortedRecipes(sort);
      setRecipes(data.recipes);
    } catch (err) {
      console.error("שגיאה בטעינת מתכונים:", err);
    }
  };

  const handleSearch = async () => {
    const hasInput = searchTitle || searchIngredient || searchCreator;
    if (!hasInput) {
      setIsSearchMode(false);
      return fetchRecipes();
    }

    try {
      setIsSearchMode(true);
      const results = await searchRecipes({
        title: searchTitle,
        ingredient: searchIngredient,
        creator_name: searchCreator,
      });
      setRecipes(results);
    } catch (err) {
      console.error("שגיאה בחיפוש מתכונים:", err);
    }
  };

  const handleClearSearch = () => {
    setSearchTitle("");
    setSearchIngredient("");
    setSearchCreator("");
    setIsSearchMode(false);
    fetchRecipes();
  };

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
      {/* 🔘 כפתור לפתיחת חיפוש מתקדם */}
      <div className="mb-4 flex flex-wrap gap-4">
        <button
          onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-hover transition text-sm"
        >
          {showAdvancedSearch ? "🔽 סגור חיפוש מתקדם" : "🔍 חיפוש מתקדם"}
        </button>

        {isSearchMode && (
          <button
            onClick={handleClearSearch}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition text-sm"
          >
            ❌ נקה חיפוש
          </button>
        )}

        <Link
          to="/recipes/create"
          className="bg-primary hover:bg-hover text-white px-4 py-2 rounded shadow transition text-sm font-semibold"
        >
          ➕ הוסף מתכון
        </Link>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="px-4 py-2 bg-primary text-white rounded shadow hover:bg-hover transition text-sm"
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

      {/* 🔍 חיפוש מתקדם שמופיע רק אם showAdvancedSearch === true */}
      {showAdvancedSearch && (
        <div className="flex justify-center mb-6">
          <div className="bg-white border rounded-lg shadow p-4 w-full sm:w-[600px]">
            <div className="grid grid-cols-1 gap-2 mb-4">
              <input
                type="text"
                placeholder="שם מתכון"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="border rounded p-2 w-full"
              />
              <input
                type="text"
                placeholder="רכיב"
                value={searchIngredient}
                onChange={(e) => setSearchIngredient(e.target.value)}
                className="border rounded p-2 w-full"
              />
              <input
                type="text"
                placeholder="שם שף"
                value={searchCreator}
                onChange={(e) => setSearchCreator(e.target.value)}
                className="border rounded p-2 w-full"
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleSearch}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-hover transition text-sm"
              >
                🔍 חפש עכשיו
              </button>

              <button
                onClick={() => setShowAdvancedSearch(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🧾 כרטיסי מתכונים */}
      {recipes.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">😕 לא נמצאו מתכונים מתאימים.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorited={favorites.includes(recipe.id)}
              onToggleFavorite={toggleFavorite}
              onRate={async (rating) => {
                try {
                  await rateRecipe(recipe.id, rating);
                  alert("תודה על הדירוג!");
                } catch {
                  alert("שגיאה בשליחת הדירוג.");
                }
              }}
              onClick={() => navigate(`/recipes/${recipe.id}`)} // ✅ ניווט מתוקן
            />
          ))}
        </div>
      )}
    </div>
  );
}
