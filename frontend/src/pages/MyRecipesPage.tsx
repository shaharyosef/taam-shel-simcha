import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyRecipes } from "../services/recipeService";
import { Recipe } from "../types/Recipe";
import RecipeCard from "../components/RecipeCard";

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data: Recipe[] = await getMyRecipes();
        setRecipes(data);
      } catch (err) {
        setError("שגיאה בטעינת המתכונים 😥");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">המתכונים שלי</h1>
        <Link
          to="/recipes/create"
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-hover transition"
        >
          ➕ הוסף מתכון חדש
        </Link>
      </div>

      {loading ? (
        <p>טוען מתכונים...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : recipes.length === 0 ? (
        <p className="text-gray-600">לא יצרת עדיין מתכונים.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} isMine={true} />
          ))}
        </div>
      )}
    </div>
  );
}
