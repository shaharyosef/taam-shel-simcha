// src/tests/pages_test/EditProfilePage.test.tsx
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import EditProfilePage from "../../pages/EditProfilePage";
import api from "../../services/api";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type { AxiosInstance } from "axios";

// הפיכת המודול למוק
vi.mock("../../services/api");
const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
};

describe("EditProfilePage", () => {
  beforeEach(() => {
    mockedApi.get.mockResolvedValue({
      data: {
        username: "testuser",
        wants_emails: true,
      },
    });

    mockedApi.put.mockResolvedValue({ status: 200 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("טוען את נתוני המשתמש בהתחלה", async () => {
    render(<EditProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("testuser")).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/לקבל עדכונים למייל/i)).toBeChecked();
  });

  test("מראה הודעת שגיאה אם הסיסמאות לא תואמות", async () => {
    render(<EditProfilePage />);

    const passwordInput = screen.getByPlaceholderText("סיסמה חדשה (לא חובה)");
    const confirmInput = screen.getByPlaceholderText("אישור סיסמה");

    await userEvent.type(passwordInput, "123456");
    await userEvent.type(confirmInput, "999999");

    fireEvent.submit(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("הסיסמאות לא תואמות")).toBeInTheDocument();
    });
  });

  test("שולח עדכון תקין ומראה הודעת הצלחה", async () => {
    render(<EditProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("testuser")).toBeInTheDocument();
    });

    const usernameInput = screen.getByPlaceholderText("שם משתמש חדש");
    await userEvent.clear(usernameInput);
    await userEvent.type(usernameInput, "newname");

    fireEvent.submit(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockedApi.put).toHaveBeenCalledWith("/auth/profile", {
        username: "newname",
        password: undefined,
        wants_emails: true,
      });

      expect(
        screen.getByText("🎉 הפרופיל עודכן בהצלחה")
      ).toBeInTheDocument();
    });
  });

  test("מציג שגיאה אם קריאת get נכשלה", async () => {
    mockedApi.get.mockRejectedValueOnce(new Error("שגיאה"));

    render(<EditProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("שגיאה בטעינת המשתמש")).toBeInTheDocument();
    });
  });

  test("מציג שגיאה אם העדכון נכשל", async () => {
    mockedApi.put.mockRejectedValueOnce(new Error("בעיה"));

    render(<EditProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("testuser")).toBeInTheDocument();
    });

    fireEvent.submit(screen.getByRole("button"));

    await waitFor(() => {
      expect(
        screen.getByText("😥 שגיאה בעדכון הפרופיל")
      ).toBeInTheDocument();
    });
  });
});
