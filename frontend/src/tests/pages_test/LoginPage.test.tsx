import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../../pages/LoginPage";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

// מגדירים את mockNavigate בצורה גלובלית
const mockNavigate = vi.fn();

// ממוקים את useNavigate עם mockNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  localStorage.clear();
  mockNavigate.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("LoginPage", () => {
  it("מציג את הטופס ואת כל השדות", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "התחברות" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("אימייל")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("סיסמה")).toBeInTheDocument();
    expect(screen.getByText("שכחתי סיסמה")).toBeInTheDocument();
    expect(screen.getByText("עדיין אין לך משתמש? הירשם עכשיו")).toBeInTheDocument();
  });

  it("שומר טוקן ומנווט אחרי התחברות תקינה", async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: "fake-token" }),
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("אימייל"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("סיסמה"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "התחברות" }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("fake-token");
      expect(mockNavigate).toHaveBeenCalledWith("/recipes");
    });
  });

  it("מציג שגיאה אם ההתחברות נכשלה", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "שגיאה באימות" }),
    });

    vi.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("אימייל"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("סיסמה"), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: "התחברות" }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("שגיאה באימות");
    });
  });
});
