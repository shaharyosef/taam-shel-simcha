// src/pages/PublicRecipesPage.jsx
import { useEffect, useState } from "react";
import { getPublicRecipes } from "../services/recipeService";
import RecipeCard from "../components/RecipeCard"; // ייבוא כרטיס מתכון
import "../css/PublicRecipesPage.css";

function PublicRecipesPage() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    getPublicRecipes()
      .then((data) => {
        console.log("✔️ קיבלתי מתכונים:", data);
        setRecipes(data);
      })
      .catch((err) => {
        console.error("❌ שגיאה בקבלת מתכונים:", err);
      });
  }, []);

  return (
    <div className="public-recipes-page">
      <h2> מתכונים ציבוריים</h2>
      {recipes.length === 0 ? (
        <p>לא נמצאו מתכונים.</p>
      ) : (
        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PublicRecipesPage;
