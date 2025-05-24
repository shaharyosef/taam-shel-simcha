// AiRecipePage.jsx
import { useState } from "react";
import { generateRecipeWithAI } from "../services/recipeService";
import "../css/AiRecipePage.css";
import { motion } from "framer-motion";

export default function AiRecipePage() {
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [showFullText, setShowFullText] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateRecipeWithAI(ingredients);
      setGeneratedRecipe(data);
      setShowFullText(false);
    } catch (err) {
      console.error("❌ שגיאה ביצירת מתכון:", err);
      setGeneratedRecipe(null);
      setError("נראה שהשף שלנו הסתבך במטבח... נסו להזין 3 רכיבים בעברית, לדוגמה: ביצה, גבינה, מלפפון");
    }
    setLoading(false);
  };

  return (
    <div className="ai-recipe-page">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        צור מתכון עם AI
      </motion.h2>

      <motion.textarea
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        placeholder="הזן רכיבים: חזה עוף, אורז, עגבנייה..."
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        rows={5}
      />

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? "יוצר מתכון..." : "צור מתכון"}
      </motion.button>

      {error && (
        <motion.div
          className="ai-error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExenlmOHFwMjFkcmJ1aHB2d3R3eHdpOTZ0cnN0NGRoZnRrZHI0YWZweCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3ohs4BSacFKI7A717q/giphy.gif"
            alt="שף מבולבל"
            className="chef-gif"
          />
          <p>{error}</p>
        </motion.div>
      )}

      {generatedRecipe && (
        <motion.div
          className="recipe-output"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3>{generatedRecipe.title}</h3>
          <p className={`cut-text ${showFullText ? "expanded" : ""}`}>
            {generatedRecipe.ingredients_text + "\n\n" + generatedRecipe.instructions}
          </p>
          <button className="toggle-button" onClick={() => setShowFullText((prev) => !prev)}>
            {showFullText ? "הסתר" : "הצג עוד"}
          </button>
        </motion.div>
      )}
    </div>
  );
}
