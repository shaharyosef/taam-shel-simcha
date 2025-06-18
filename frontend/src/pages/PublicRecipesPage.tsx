import { useEffect, useState } from "react";
import { Recipe } from "../types/Recipe";
import { getPublicRecipes } from "../services/recipeService";
import { Star, ChefHat } from "lucide-react";
import { Link } from "react-router-dom";

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
      {recipes.map((recipe) => (
        <Link
          to={`/guest-view/${recipe.id}`}
          state={{ recipe }} // ⬅️ שולחים את המתכון לדף הבא
          key={recipe.id}
          className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-gray-200 flex flex-col w-[300px] text-inherit no-underline"
        >
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            {recipe.image_url?.trim() ? (
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                <ChefHat className="w-16 h-16 text-orange-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            {recipe.average_rating && (
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md">
                <span className="text-sm font-semibold text-gray-800">
                  {recipe.average_rating.toFixed(1)}
                </span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
            )}
          </div>

          <div className="p-4 flex-1 flex flex-col text-right">
            <div className="mb-2 min-h-[3rem]">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors duration-200 line-clamp-2">
                {recipe.title}
              </h3>
              <div className="flex items-center justify-end gap-1.5 text-sm text-gray-600" dir="ltr">
                <span className="truncate text-left inline-block max-w-[160px]">{recipe.creator_name}</span>
                <ChefHat className="w-4 h-4 flex-shrink-0" />
              </div>
            </div>
            {recipe.description && (
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 mb-2">
                📝 {recipe.description}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
