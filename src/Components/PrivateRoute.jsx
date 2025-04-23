import React from "react";
import { Navigate } from "react-router-dom";
import { UserData } from "../context/UserContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isAuth } = UserData();

  // If user is not authenticated, redirect to login
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // If user role is not in allowedRoles, redirect to home
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
