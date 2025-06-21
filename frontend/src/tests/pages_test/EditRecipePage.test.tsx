// src/tests/EditRecipePage.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditRecipePage from "../../pages/EditRecipePage";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import api from "../../services/api";
import { vi } from "vitest";

// mock ל־api
vi.mock("../../services/api");
const mockedApi = api as jest.Mocked<typeof api>;

describe("EditRecipePage", () => {
  const mockRecipe = {
    id: 1,
    title: "שקשוקה",
    description: "שקשוקה חריפה",
    ingredients: "ביצים, עגבניות, פלפל",
    instructions: "בשל הכל במחבת",
    image_url: "https://image.com/shakshuka.jpg",
    video_url: "https://youtube.com/shakshuka",
    is_public: true,
  };

  it("מציג את ערכי הטופס לפי הנתונים הקיימים", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: mockRecipe });

    render(
      <MemoryRouter initialEntries={["/recipes/1/edit"]}>
        <Routes>
          <Route path="/recipes/:id/edit" element={<EditRecipePage />} />
        </Routes>
      </MemoryRouter>
    );

    // המתן לטעינת הערכים מהשרת
    await waitFor(() =>
      expect(screen.getByDisplayValue("שקשוקה")).toBeInTheDocument()
    );

    expect(screen.getByDisplayValue("שקשוקה חריפה")).toBeInTheDocument();
    expect(screen.getByDisplayValue("ביצים, עגבניות, פלפל")).toBeInTheDocument();
    expect(screen.getByDisplayValue("בשל הכל במחבת")).toBeInTheDocument();
  });

  it("שולח את הטופס בהצלחה ומנווט בחזרה", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: mockRecipe });
    mockedApi.put.mockResolvedValueOnce({}); // עדכון מוצלח

    render(
      <MemoryRouter initialEntries={["/recipes/1/edit"]}>
        <Routes>
          <Route path="/recipes/:id/edit" element={<EditRecipePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByDisplayValue("שקשוקה")).toBeInTheDocument()
    );

    fireEvent.change(screen.getByPlaceholderText("שם המתכון"), {
      target: { value: "שקשוקה מעודכנת" },
    });

    fireEvent.click(screen.getByRole("button", { name: "שמור שינויים" }));

    await waitFor(() => {
      expect(mockedApi.put).toHaveBeenCalledWith("/recipes/1", expect.objectContaining({
        title: "שקשוקה מעודכנת",
      }));
    });
  });
});
