import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GuestLayout from "./layouts/GuestLayout";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AllRecipesPage from "./pages/AllRecipesPage";
import ProfilePage from "./pages/ProfilePage";
import PublicRecipesPage from "./pages/PublicRecipesPage";
import AiRecipePage from "./pages/AiRecipePage";

import "./css/App.css";
import './index.css'; // ← חשוב שזה ייובא


function App() {
  return (
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
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          title="טעם של שמחה"
        />
      </div>

      {/* 👇 עטיפה שמחברת לעיצוב ב־App.css */}
      <div className="App">
        <Routes>
          <Route element={<GuestLayout />}>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/public-recipes" element={<PublicRecipesPage />} />
            <Route path="/ai-recipe" element={<AiRecipePage />} />
            {/* הוספתי את ה־path הזה כדי שהכפתור יוביל לעמוד המתכונים */}

          </Route>

          <Route element={<MainLayout />}>
            <Route path="/recipes" element={<AllRecipesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;