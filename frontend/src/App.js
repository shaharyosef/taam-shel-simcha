// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GuestLayout from "./layouts/GuestLayout";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AllRecipesPage from "./pages/AllRecipesPage";
import ProfilePage from "./pages/ProfilePage";
import PublicRecipesPage from "./pages/PublicRecipesPage";
import AiRecipePage from "./pages/AiRecipePage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

import "./css/App.css";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* לוגו קבוע */}
        <div
          style={{
            position: "fixed",
            top: "1rem",
            left: "1rem",
            zIndex: 9999,
          }}
        >
          <img
            src="/savta_icon.png"
            alt="לוגו סבתא"
            style={{
              width: "110px",
              borderRadius: "50%",
              transition: "transform 0.2s ease-in-out",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
            title="טעם של שמחה"
          />
        </div>

        <div className="App">
          <Routes>
            {/* אורחים */}
            <Route element={<GuestLayout />}>
              <Route path="/" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/public-recipes" element={<PublicRecipesPage />} />
            </Route>

            {/* משתמשים מחוברים בלבד */}
            <Route element={<MainLayout />}>
              <Route
                path="/recipes"
                element={
                  <ProtectedRoute>
                    <AllRecipesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* זמין לכולם – כולל GUEST */}
            <Route path="/ai-recipe" element={<AiRecipePage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
