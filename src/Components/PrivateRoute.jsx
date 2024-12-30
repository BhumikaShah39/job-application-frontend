import React from "react";
import { Navigate } from "react-router-dom";
import { UserData } from "../context/UserContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuth, user } = UserData();

  if (!isAuth) {
    return <Navigate to="/login" />; // Redirect to login if not authenticated
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />; // Redirect to home if role is not allowed
  }

  return children; // Render the children components if authenticated and role is allowed
};

export default PrivateRoute;
