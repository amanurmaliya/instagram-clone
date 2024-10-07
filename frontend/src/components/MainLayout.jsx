import React from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar.jsx";

function MainLayout() {
  return (
    <div>
      <LeftSidebar></LeftSidebar>
      <div>
        {/* // This is used to Render the childerns of the tool */}
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
