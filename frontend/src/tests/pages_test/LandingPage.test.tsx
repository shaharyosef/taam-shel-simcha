// src/tests/LandingPage.test.tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "../../pages/LandingPage";

describe("LandingPage", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
  });

  test("מציג את כותרת האתר", () => {
    expect(screen.getByRole("heading", { name: /טעם של שמחה/i })).toBeInTheDocument();
  });

  test("מציג כפתור הרשמה", () => {
    const registerLink = screen.getByRole("link", { name: /התחבר \/ הירשם/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  test("מציג קישור למתכונים ציבוריים", () => {
    const publicLink = screen.getByRole("link", { name: /עיין במתכונים ציבוריים/i });
    expect(publicLink).toBeInTheDocument();
    expect(publicLink).toHaveAttribute("href", "/public");
  });

  test("מציג קישור ל-AI", () => {
    const aiLink = screen.getByRole("link", { name: /ai צור מתכון/i });
    expect(aiLink).toBeInTheDocument();
    expect(aiLink).toHaveAttribute("href", "/ai-recipe");
  });

  test("מציג את סיפור השם", () => {
    expect(screen.getByText(/הפרויקט מוקדש לסבתא שלי/)).toBeInTheDocument();
  });

  test("מציג את קטע 'מה תמצאו כאן'", () => {
    expect(screen.getByText(/מאגר מתכונים ציבוריים/)).toBeInTheDocument();
    expect(screen.getByText(/AI יצירת מתכון עם/)).toBeInTheDocument();
    expect(screen.getByText(/שתף את המתכון שלך/)).toBeInTheDocument();
  });

  test("מציג טקסט תמיכה ומייל", () => {
    expect(screen.getByText(/צריכים עזרה\?/i)).toBeInTheDocument();
    expect(screen.getByText(/taam\.shel\.simcha@gmail\.com/i)).toBeInTheDocument();
  });
});
