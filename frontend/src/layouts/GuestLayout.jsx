import { Outlet } from "react-router-dom";
import GuestNavbar from "../components/GuestNavbar";

function GuestLayout() {
  return (
    <>
      <GuestNavbar />
      <div className="guest-layout">
        <Outlet />
      </div>
    </>
  );
}

export default GuestLayout;
