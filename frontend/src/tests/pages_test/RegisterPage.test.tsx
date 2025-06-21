// src/tests/pages_test/RegisterPage.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "../../pages/RegisterPage";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import { vi } from "vitest";

// מונעים קריאות אמיתיות לשרת
vi.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// פונקציית עזר לרינדור העמוד בתוך MemoryRouter (לצורך שימוש ב־navigate)
function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );
}

describe("RegisterPage", () => {
  // ✅ בדיקה שהשדות מוצגים כמו שצריך
  it("מציג את כל שדות ההרשמה", () => {
    renderRegisterPage();
    expect(screen.getByPlaceholderText("שם משתמש")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("אימייל")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("סיסמה")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("אישור סיסמה")).toBeInTheDocument();
    expect(screen.getByText("לקבל מיילים ועדכונים")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "הרשמה" })).toBeInTheDocument();
  });

  // ❌ בדיקה שהשגיאה מוצגת אם הסיסמאות לא תואמות
  it("מציג הודעת שגיאה אם הסיסמאות לא תואמות", async () => {
    renderRegisterPage();

    fireEvent.change(screen.getByPlaceholderText("שם משתמש"), {
      target: { value: "shahar" },
    });
    fireEvent.change(screen.getByPlaceholderText("אימייל"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("סיסמה"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText("אישור סיסמה"), {
      target: { value: "654321" },
    });

    fireEvent.click(screen.getByRole("button", { name: "הרשמה" }));

    await waitFor(() =>
      expect(screen.getByText("הסיסמאות לא תואמות")).toBeInTheDocument()
    );
  });

  // ✅ בדיקה שההרשמה מתבצעת בהצלחה ומנווטים הלאה (לא בודק בפועל את הניווט כי אין spy)
  it("שולח נתוני הרשמה בהצלחה", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 1, username: "shahar" } });
    renderRegisterPage();

    fireEvent.change(screen.getByPlaceholderText("שם משתמש"), {
      target: { value: "shahar" },
    });
    fireEvent.change(screen.getByPlaceholderText("אימייל"), {
      target: { value: "shahar@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("סיסמה"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText("אישור סיסמה"), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: "הרשמה" }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith("http://localhost:8000/auth/signup", {
        username: "shahar",
        email: "shahar@example.com",
        password: "123456",
        wants_emails: true,
      });
    });
  });

  // ❌ בדיקה שבמקרה של שגיאה מהשרת – מוצגת הודעה למשתמש
  it("מציג שגיאה אם השרת מחזיר שגיאה", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { detail: "האימייל כבר בשימוש" } },
    });
    renderRegisterPage();

    fireEvent.change(screen.getByPlaceholderText("שם משתמש"), {
      target: { value: "shahar" },
    });
    fireEvent.change(screen.getByPlaceholderText("אימייל"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("סיסמה"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText("אישור סיסמה"), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: "הרשמה" }));

    await waitFor(() =>
      expect(screen.getByText("האימייל כבר בשימוש")).toBeInTheDocument()
    );
  });
});
