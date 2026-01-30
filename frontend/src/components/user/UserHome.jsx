import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const UserHome = () => {
  const location = useLocation();

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (location.pathname === "/user") {
    return <Navigate to="/user/dashboard" replace />;
  }

  return <Outlet />;
};

export default UserHome;
