// src/tests/pages_test/PublicRecipesPage.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import PublicRecipesPage from "@/pages/PublicRecipesPage";
import * as recipeService from "@/services/recipeService";
import { BrowserRouter } from "react-router-dom";
import { vi } from "vitest";

// מוקים של מתכונים לדוגמה
const mockRecipes = [
  {
    id: 1,
    title: "קציצות טבעוניות",
    image_url: "https://example.com/ktsitsot.jpg",
    creator_name: "אורלי",
    average_rating: 4.7,
    difficulty: "Medium",
    prep_time: 45,
    description: "טעים ובריא עם עדשים ירוקות",
  },
  {
    id: 2,
    title: "עוגת שוקולד",
    image_url: "",
    creator_name: "רועי",
    average_rating: 4.2,
    difficulty: "Easy",
    prep_time: 30,
    description: "עוגה פשוטה וטעימה מאוד",
  },
];

// נרנדר את הדף ונמקד את המוק על getPublicRecipes
vi.spyOn(recipeService, "getPublicRecipes").mockResolvedValue(mockRecipes);

describe("PublicRecipesPage", () => {
  it("מציג את כל המתכונים הציבוריים עם הפרטים הנכונים", async () => {
    render(
      <BrowserRouter>
        <PublicRecipesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("קציצות טבעוניות")).toBeInTheDocument();
      expect(screen.getByText("עוגת שוקולד")).toBeInTheDocument();
    });

    expect(screen.getAllByText("🎯 בינוני")[0]).toBeInTheDocument();
    expect(screen.getAllByText("🎯 קל")[0]).toBeInTheDocument();
    expect(screen.getByText("🕒 45 דק'")).toBeInTheDocument();
    expect(screen.getByText("🕒 30 דק'")).toBeInTheDocument();
    expect(screen.getByText("📝 טעים ובריא עם עדשים ירוקות")).toBeInTheDocument();
    expect(screen.getByText("📝 עוגה פשוטה וטעימה מאוד")).toBeInTheDocument();
  });
});
