import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <>
      <Navbar />
      <div className="main-layout">
        <Outlet />
      </div>
    </>
  );
}
export default MainLayout;
