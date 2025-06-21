// src/tests/ForgotPasswordPage.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPasswordPage from "../../pages/ForgotPasswordPage";
import { vi } from "vitest";
import axios from "axios";

// מוקים ל־axios
vi.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("מציג טופס איפוס סיסמה", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText("שכחת סיסמה?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("האימייל שלך")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "שלח קישור איפוס" })).toBeInTheDocument();
  });

  it("שולח בקשת איפוס סיסמה בהצלחה", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("האימייל שלך"), {
      target: { value: "test@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: "שלח קישור איפוס" }));

    await waitFor(() =>
      expect(screen.getByText("קישור לאיפוס סיסמה נשלח למייל שלך")).toBeInTheDocument()
    );

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8000/auth/forgot-password",
      { email: "test@example.com" }
    );
  });

  it("מציג הודעת שגיאה אם הבקשה נכשלת", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

    render(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText("האימייל שלך"), {
      target: { value: "wrong@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: "שלח קישור איפוס" }));

    await waitFor(() =>
      expect(screen.getByText("לא הצלחנו לשלוח קישור. ודא שהאימייל נכון.")).toBeInTheDocument()
    );
  });
});
