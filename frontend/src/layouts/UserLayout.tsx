// src/layouts/UserLayout.tsx
import { Outlet } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import RequireAuth from "../components/RequireAuth"
import AIChefChatWidget from "../components/AIChefChatWidget";

export default function UserLayout() {
  return (
    <>
      <UserNavbar />
      <main className="p-4">
        <RequireAuth>
          <Outlet />
          <AIChefChatWidget />
        </RequireAuth>
      </main>
    </>
  );
}
