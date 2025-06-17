// src/layouts/UserLayout.tsx
import { Outlet } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import RequireAuth from "../components/RequireAuth";

export default function UserLayout() {
  return (
    <>
      <UserNavbar />
      <main className="p-4">
        <RequireAuth>
          <Outlet />
        </RequireAuth>
      </main>
    </>
  );
}
