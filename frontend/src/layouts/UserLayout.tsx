// src/layouts/UserLayout.tsx
import { Outlet } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";

export default function UserLayout() {
  return (
    <>
      <UserNavbar />
      <main className="p-4">
        <Outlet />
      </main>
    </>
  );
}
