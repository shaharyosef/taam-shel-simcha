import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MyRecipesPage from "../../pages/MyRecipesPage";
import * as recipeService from "../../services/recipeService";
import { vi } from "vitest";

// נבצע mock לפונקציות השירות
vi.mock("../../services/recipeService");

describe("MyRecipesPage", () => {
  const mockRecipes = [
    {
      id: 1,
      title: "קוסקוס",
      description: "טעים מאוד",
      ingredients: "סולת, מים",
      instructions: "לבשל",
      image_url: "",
      user_id: 1,
      difficulty: "Easy",
      average_rating: 4.5,
      prep_time: 30,
      creator_name: "שחר",
      created_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    (recipeService.getMyRecipes as any).mockResolvedValue(mockRecipes);
    (recipeService.getFavorites as any).mockResolvedValue([1]);
  });

  it("מציג טקסט טעינה בהתחלה", () => {
    render(
      <MemoryRouter>
        <MyRecipesPage />
      </MemoryRouter>
    );
    expect(screen.getByText("טוען מתכונים...")).toBeInTheDocument();
  });

  it("מציג את המתכונים שלי לאחר טעינה", async () => {
    render(
      <MemoryRouter>
        <MyRecipesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("המתכונים שלי 🍲")).toBeInTheDocument();
    });

    expect(screen.getByText("➕ הוסף מתכון חדש")).toBeInTheDocument();
    expect(screen.getByText("קוסקוס")).toBeInTheDocument();
    expect(screen.getByText("שחר")).toBeInTheDocument();
  });

  it("מציג הודעת שגיאה אם הבקשה נכשלת", async () => {
    (recipeService.getMyRecipes as any).mockRejectedValueOnce(new Error("שגיאה"));
    (recipeService.getFavorites as any).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <MyRecipesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("שגיאה בטעינת המתכונים שלי 😥")).toBeInTheDocument();
    });
  });

  it("מציג הודעה אם אין מתכונים", async () => {
    (recipeService.getMyRecipes as any).mockResolvedValueOnce([]);
    (recipeService.getFavorites as any).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <MyRecipesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("לא יצרת עדיין מתכונים.")).toBeInTheDocument();
    });
  });
});
