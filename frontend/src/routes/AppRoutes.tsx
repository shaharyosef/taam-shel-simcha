import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import AiRecipePage from "../pages/AiRecipePage";
import PublicRecipesPage from "../pages/PublicRecipesPage";
import AllRecipesPage from "../pages/AllRecipesPage";
import RecipeDetailsPage from "../pages/RecipeDetailsPage";
import GuestLayout from "../layouts/ GuestLayout";
import UserLayout from "../layouts/UserLayout";
import RequireAuth from "../components/RequireAuth";
import EditRecipePage from "../pages/EditRecipePage";
import CreateRecipePage from "../pages/CreateRecipePage";
import EditProfilePage from "../pages/EditProfilePage";
import MyRecipesPage from "../pages/MyRecipesPage";
import MyFavoritesPage from "../pages/MyFavoritesPage";
import AdminDashboard from "../pages/AdminDashboard";
import ProfilePage from "../pages/ProfilePage";
import GuestRecipePage from "../pages/GuestRecipePage";

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
        <Route path="/guest-view/:id" element={<GuestRecipePage />} />


      </Route>

      {/* Protected user routes */}
      <Route
        element={
          <RequireAuth>
            <UserLayout />
          </RequireAuth>
        }
      >
        <Route path="/recipes" element={<AllRecipesPage />} />
        <Route path="/recipes/ai" element={<AiRecipePage />} />
        <Route path="/recipes/:id" element={<RecipeDetailsPage />} />
        <Route path="/recipes/:id/edit" element={<EditRecipePage />} />
        <Route path="/recipes/create" element={<CreateRecipePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/recipes/mine" element={<MyRecipesPage />} />
        <Route path="/favorites" element={<MyFavoritesPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}
