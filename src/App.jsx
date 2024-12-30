import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Header from "./Components/header/Header";
import FreelancerHeader from "./Components/header/Freelancer_header";
import HirerHeader from "./Components/header/Hirer_header";
import AdminHeader from "./Components/header/Admin_header";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import FreelancerDashboard from "./pages/home/Freelancer_dashboard";
import HirerDashboard from "./pages/home/Hirer_dashboard";
import AdminDashboard from "./pages/home/Admin_dashboard";
import PrivateRoute from "./Components/PrivateRoute";
import { UserData } from "./context/UserContext"; // Import context for user data

const App = () => {
  const { user, isAuth } = UserData();

  const getHeader = () => {
    if (!isAuth || !user) {
      return <Header />; // Default Header for unauthenticated users
    }

    // Render headers based on user role
    switch (user.role?.toLowerCase()) {
      case "admin":
        return <AdminHeader />;
      case "hirer":
        return <HirerHeader />;
      case "user":
        return <FreelancerHeader />;
      default:
        return <Header />; // Fallback Header
    }
  };

  return (
    <Router>
      {getHeader()}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/user/:id"
          element={
            <PrivateRoute allowedRoles={["user"]}>
              <FreelancerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/hirer/:id"
          element={
            <PrivateRoute allowedRoles={["hirer"]}>
              <HirerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/:id"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
