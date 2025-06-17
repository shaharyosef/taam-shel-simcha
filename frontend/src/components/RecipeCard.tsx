import { Recipe } from "../types/Recipe";
import { Link } from "react-router-dom";

interface RecipeCardProps {
  recipe: Recipe;
  isMine?: boolean;
}

export default function RecipeCard({ recipe, isMine = false }: RecipeCardProps) {
  return (
    <div className="border rounded-xl p-4 shadow hover:shadow-lg transition bg-white">
      {recipe.image_url && (
        <img src={recipe.image_url} alt={recipe.title} className="w-full h-48 object-cover rounded mb-4" />
      )}
      <h2 className="text-xl font-bold text-gray-800 mb-2">{recipe.title}</h2>
      <p className="text-gray-600">{recipe.description}</p>
      {isMine && (
        <div className="mt-4 flex gap-2">
          <Link to={`/recipes/${recipe.id}/edit`} className="text-sm text-blue-600 hover:underline">
            ✏️ עריכה
          </Link>
          <Link to={`/recipes/${recipe.id}`} className="text-sm text-green-600 hover:underline">
            👁️ צפייה
          </Link>
        </div>
      )}
    </div>
  );
}
