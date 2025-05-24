import { useEffect, useState } from "react";
import { getPublicRecipes } from "../services/recipeService";
import "../css/PublicRecipesPage.css";


function AllRecipesPage() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    async function fetch() {
      const data = await getPublicRecipes();
      setRecipes(data);
    }
    fetch();
  }, []);

  return (
    <div>
      <h2>כל המתכונים</h2>
      {/* כאן תוכל למפות מתכונים וכו' */}
    </div>
  );
}

export default AllRecipesPage;
