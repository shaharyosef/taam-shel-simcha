import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Recipe } from "../types/Recipe";
import { getAllPublicRecipes } from "../services/recipeService";
import CommentsSection from "../components/CommentsSection";

export default function RecipeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    async function fetch() {
      const all = await getAllPublicRecipes();
      const match = all.find((r: Recipe) => r.id === Number(id));
      setRecipe(match || null);
    }

    fetch();
  }, [id]);

  if (!recipe) return <div className="p-4">טוען מתכון...</div>;

  const formattedDate = new Date(recipe.created_at).toLocaleString("he-IL", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const ingredients = recipe.ingredients?.split("\n").filter(Boolean);
  const instructions = recipe.instructions?.split("\n").filter(Boolean);

  return (
    <div className="p-4 max-w-3xl mx-auto text-right" dir="rtl">
      <h1 className="text-2xl font-bold mb-2">{recipe.title}</h1>
      <p className="text-sm text-gray-600">👨‍🍳 {recipe.creator_name}</p>

      <div className="bg-yellow-100 inline-block px-3 py-1 rounded text-sm font-semibold text-yellow-800 my-2">
        ⭐ {recipe.average_rating != null ? recipe.average_rating.toFixed(1) : "אין דירוג"}
      </div>

      <p className="text-sm text-gray-500 mb-4">📅 נוצר ב־{formattedDate}</p>

      <img
        src={recipe.image_url?.trim() || "/images/no_pic.png"}
        alt={recipe.title}
        className="w-full max-h-[400px] object-contain rounded mb-6"
      />

      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">🧂 מרכיבים</h2>
        {ingredients?.length ? (
          <ul className="list-disc pr-5 text-sm text-gray-700 space-y-1">
            {ingredients.map((item, idx) => (
              <li key={idx} className="break-words whitespace-pre-line">{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">לא צוינו מרכיבים</p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">👨‍🍳 הוראות הכנה</h2>
        {instructions?.length ? (
          <ol className="list-decimal pr-5 text-sm text-gray-700 space-y-1">
            {instructions.map((step, idx) => (
              <li key={idx} className="break-words whitespace-pre-line">{step}</li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-gray-500">לא צוינו הוראות הכנה</p>
        )}
      </div>

      <CommentsSection recipeId={recipe.id} />
    </div>
  );
}
