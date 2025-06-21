import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RecipeDetailsPage from "../../pages/RecipeDetailsPage";
import * as recipeService from "../../services/recipeService";
import api from "../../services/api";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

// מוקים
vi.mock("../../services/recipeService");
vi.mock("../../services/api");

describe("RecipeDetailsPage", () => {
  const mockRecipe = {
    id: 1,
    title: "שקשוקה",
    description: "טעים ובריא",
    ingredients: "ביצים, עגבניות, בצל",
    instructions: "1. חותכים\n2. מבשלים",
    difficulty: "Easy",
    prep_time: 20,
    creator_name: "שחר",
    created_at: new Date().toISOString(),
    image_url: "",
    user_id: 1,
    average_rating: 4.5,
  };

  beforeEach(() => {
    // נשתמש בקאסט תקין עבור vi ולא jest
    const mockedApi = api as unknown as {
      get: (url: string) => Promise<any>;
    };

    mockedApi.get = vi.fn((url: string) => {
      if (url === "/auth/me") {
        return Promise.resolve({ data: { id: 1 } });
      }
      if (url === "/recipes/1") {
        return Promise.resolve({ data: mockRecipe });
      }
      return Promise.reject();
    });

    (recipeService.getFavorites as jest.Mock).mockResolvedValue([]);
  });

  it("מציג את פרטי המתכון", async () => {
    render(
      <MemoryRouter initialEntries={["/recipes/1"]}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("טוען מתכון...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("שקשוקה")).toBeInTheDocument();
    });

    expect(screen.getByText(/שחר/)).toBeInTheDocument();
    expect(screen.getByText("📊 דרג את המתכון")).toBeInTheDocument();
    expect(screen.getByText("🧂 מרכיבים")).toBeInTheDocument();
    expect(screen.getByText("👨‍🍳 הוראות הכנה")).toBeInTheDocument();
    expect(screen.getByText("💬 תגובות")).toBeInTheDocument();
  });
});
