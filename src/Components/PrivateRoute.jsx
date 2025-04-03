import React from "react";
import { Navigate } from "react-router-dom";
import { UserData } from "../context/UserContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuth, user, loading } = UserData();

  if (loading) {
    return <div>Loading...</div>; // Prevent redirect while loading
  }

  if (!isAuth || !user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
