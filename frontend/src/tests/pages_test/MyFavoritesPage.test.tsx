import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MyFavoritesPage from "../../pages/MyFavoritesPage";
import * as recipeService from "../../services/recipeService";
import { vi } from "vitest";

// יוצרים mock לפונקציות הרלוונטיות בשירות המתכונים
vi.mock("../../services/recipeService");

describe("MyFavoritesPage", () => {
  const mockFavoriteRecipes = [
    {
      id: 1,
      title: "פסטה שמנת פטריות",
      description: "פסטה קרמית וטעימה",
      ingredients: "פסטה, שמנת, פטריות",
      instructions: "לבשל ולהגיש חם",
      image_url: "",
      user_id: 1,
      difficulty: "Medium",
      average_rating: 4.7,
      prep_time: 25,
      creator_name: "שחר",
      created_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    (recipeService.getmyFavorites as any).mockResolvedValue(mockFavoriteRecipes);
  });

  it("מציג הודעת טעינה בהתחלה", () => {
    render(
      <MemoryRouter>
        <MyFavoritesPage />
      </MemoryRouter>
    );

    // בודק שהטקסט מופיע בתחילת הטעינה
    expect(screen.getByText("טוען מתכונים...")).toBeInTheDocument();
  });

  it("מציג את המתכונים המועדפים לאחר טעינה", async () => {
    render(
      <MemoryRouter>
        <MyFavoritesPage />
      </MemoryRouter>
    );

    // מחכה שהמתכון יוצג בפועל
    await waitFor(() => {
      expect(screen.getByText("פסטה שמנת פטריות")).toBeInTheDocument();
    });

    // בודק אלמנטים נוספים
    expect(screen.getByText("המועדפים שלי 💖")).toBeInTheDocument();
    expect(screen.getByText("שחר")).toBeInTheDocument();
  });

  it("מציג הודעת שגיאה במקרה של תקלה בבקשת המועדפים", async () => {
    (recipeService.getmyFavorites as any).mockRejectedValueOnce(new Error("שגיאה"));

    render(
      <MemoryRouter>
        <MyFavoritesPage />
      </MemoryRouter>
    );

    // בודק שהודעת שגיאה מוצגת
    await waitFor(() => {
      expect(screen.getByText("שגיאה בטעינת המועדפים 😥")).toBeInTheDocument();
    });
  });

  it("מציג הודעה אם אין בכלל מתכונים מועדפים", async () => {
    (recipeService.getmyFavorites as any).mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <MyFavoritesPage />
      </MemoryRouter>
    );

    // בודק הודעה עבור רשימה ריקה
    await waitFor(() => {
      expect(screen.getByText("לא הוספת עדיין מתכונים למועדפים.")).toBeInTheDocument();
    });
  });
});

