import { useEffect, useState } from "react";
import { Recipe } from "../types/Recipe";
import { getPublicRecipes } from "../services/recipeService";

export default function PublicRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const data = await getPublicRecipes();
        setRecipes(data);
      } catch (err) {
        console.error("שגיאה בטעינת מתכונים:", err);
      }
    }

    fetchRecipes();
  }, []);

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" dir="rtl">
      {recipes.map((Recipe) => (
        <div
          key={Recipe.id}
          className="relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 text-right"
          dir="rtl"
        >
          {/* דירוג בפינה הימנית העליונה */}
          <div className="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-1 rounded-md text-xs font-bold shadow">
            {Recipe.average_rating != null ? Recipe.average_rating.toFixed(1) : "אין דירוג"}
          </div>

          {/* תמונה */}
          <img
            src={
              Recipe.image_url && Recipe.image_url.trim() !== ""
                ? Recipe.image_url
                : "/images/no_pic.png"
            }
            alt={Recipe.title}
            className="w-full h-48 object-contain object-center  rounded-t-2xl"
          />

          {/* תוכן */}
          <div className="p-4 space-y-2">
            <h3 className="text-lg font-bold text-gray-800">{Recipe.title}</h3>
            <p className="text-sm text-gray-500">🧑‍🍳 {Recipe.creator_name}</p>

            {Recipe.description && (
              <p className="text-sm text-gray-700 line-clamp-2">
                📝{Recipe.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
