import { useState } from "react";
import { generateAIRecipe } from "../services/aiService";

export default function AiRecipePage() {
  const [ingredients, setIngredients] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await generateAIRecipe(ingredients);
      setResult(data);
    } catch (err) {
      alert("שגיאה ביצירת מתכון מה-AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">✨  AI צור מתכון עם </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="הכנס רשימת מצרכים (למשל: עגבנייה, בצל, שמן זית)"
          className="w-full p-2 border rounded text-right"
          rows={4}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white py-2 px-4 rounded hover:bg-hover w-full"
        >
          {loading ? "...יוצר מתכון" : "צור מתכון"}
        </button>
      </form>

      {result && (
  <div className="mt-6 bg-white shadow p-4 rounded space-y-4" dir="rtl">
    <h3 className="text-xl font-bold">{result.title}</h3>

    <div>
      <span className="font-semibold">🧺 מצרכים:</span>
      <div className="mt-1 space-y-1">
        {String(result.ingredients)
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line: string, idx: number) => (
            <p key={idx}>{line}</p>
          ))}
      </div>
    </div>

    <div>
      <span className="font-semibold">📋 הוראות:</span>
      <div className="mt-1 space-y-1">
        {String(result.instructions)
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((step: string, idx: number) => (
            <p key={idx}>{step}</p>
          ))}
      </div>
    </div>
  </div>
)}

    </div>
  );
}
