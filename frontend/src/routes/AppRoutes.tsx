import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import AiRecipePage from "../pages/AiRecipePage";
import PublicRecipesPage from "../pages/PublicRecipesPage";
import AllRecipesPage from "../pages/AllRecipesPage";

import GuestLayout from "../layouts/ GuestLayout";
import UserLayout from "../layouts/UserLayout";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Guest routes */}
      <Route element={<GuestLayout />}>
        <Route path="/" element={<Navigate to="/public" />} />
        <Route path="/public" element={<PublicRecipesPage />} />
        <Route path="/ai-recipe" element={<AiRecipePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* User routes */}
      <Route element={<UserLayout />}>
        <Route path="/recipes" element={<AllRecipesPage />} />
        <Route path="/recipes/ai" element={<AiRecipePage />} />
      </Route>
    </Routes>
  );
}
