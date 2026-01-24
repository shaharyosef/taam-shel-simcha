// UserLayout.tsx
import { Outlet } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import AIChefChatWidget from "../components/AIChefChatWidget";

export default function UserLayout() {

  return (
    <>
      <UserNavbar />
      <main className="p-4">
        <AIChefChatWidget />
        <Outlet />
      </main>
    </>
  );
}
