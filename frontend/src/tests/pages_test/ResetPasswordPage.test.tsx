import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPasswordPage from "../../pages/ResetPasswordPage";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import { vi } from "vitest";

vi.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

function renderWithToken(token = "dummy-token") {
  const route = `/reset-password?token=${token}`;
  window.history.pushState({}, "Reset Password", route);

  return render(
    <MemoryRouter>
      <ResetPasswordPage />
    </MemoryRouter>
  );
}

describe("ResetPasswordPage", () => {
  it("מציג טופס איפוס סיסמה", () => {
    renderWithToken();
    expect(
      screen.getByRole("heading", { name: "איפוס סיסמה" })
    ).toBeInTheDocument(); // ✅ בודק את הכותרת בלבד
    expect(screen.getByPlaceholderText("סיסמה חדשה")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("אישור סיסמה")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "איפוס סיסמה" })
    ).toBeInTheDocument(); // ✅ בודק את הכפתור בלבד
  });

  it("מציג הודעת שגיאה אם הסיסמאות לא תואמות", async () => {
    renderWithToken();
    fireEvent.change(screen.getByPlaceholderText("סיסמה חדשה"), {
      target: { value: "password1" },
    });
    fireEvent.change(screen.getByPlaceholderText("אישור סיסמה"), {
      target: { value: "password2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "איפוס סיסמה" }));
    await waitFor(() =>
      expect(screen.getByText("הסיסמאות לא תואמות")).toBeInTheDocument()
    );
  });

  it("שולח בקשה בהצלחה ומציג הודעת הצלחה", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });
    renderWithToken();
    fireEvent.change(screen.getByPlaceholderText("סיסמה חדשה"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("אישור סיסמה"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "איפוס סיסמה" }));
    await waitFor(() =>
      expect(screen.getByText("הסיסמה אופסה בהצלחה!")).toBeInTheDocument()
    );
  });

  it("מציג שגיאה אם השרת מחזיר שגיאה", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Server error"));
    renderWithToken();
    fireEvent.change(screen.getByPlaceholderText("סיסמה חדשה"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("אישור סיסמה"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "איפוס סיסמה" }));
    await waitFor(() =>
      expect(
        screen.getByText("אירעה שגיאה בעת איפוס הסיסמה")
      ).toBeInTheDocument()
    );
  });
});
