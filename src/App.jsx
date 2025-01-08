import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from "react-router-dom";
import Home from "./pages/home/Home";
import Header from "./Components/header/Header";
import FreelancerHeader from "./Components/header/Freelancer_header";
import HirerHeader from "./Components/header/Hirer_header";
import AdminHeader from "./Components/header/Admin_header";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import FreelancerDashboard from "./pages/home/Freelancer_dashboard";
import HirerDashboard from "./pages/home/Hirer_dashboard";
import AddJobForm from "./pages/home/AddJobForm";
import Applications from "./pages/home/Applications";
import Analytics from "./pages/home/Analytics";
import Notifications from "./pages/home/Notifications";
import Projects from "./pages/home/Projects";
import AdminDashboard from "./pages/home/Admin_dashboard";
import PrivateRoute from "./Components/PrivateRoute";
import { UserData } from "./context/UserContext";
import Footer from "./Components/footer/Footer";

const App = () => {
  const { user, isAuth } = UserData();

  // Dynamically select the header based on the user's role
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
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes for Freelancer (User) */}
            <Route
              path="/user/:id"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <FreelancerDashboard />
                </PrivateRoute>
              }
            />

            {/* Protected Routes for Hirer */}
            <Route
              path="/hirer/:id/*"
              element={
                <PrivateRoute allowedRoles={["hirer"]}>
                  <HirerRoutes />
                </PrivateRoute>
              }
            />

            {/* Protected Routes for Admin */}
            <Route
              path="/admin/:id"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
};

const HirerRoutes = () => {
  const { user } = UserData(); // Access the user context

  if (!user) {
    return <p>Loading...</p>; // Fallback for cases where the user isn't loaded yet
  }

  return (
    <Routes>
      <Route path="/" element={<HirerDashboard />} />
      <Route path="dashboard" element={<HirerDashboard />} />
      <Route
        path="add-jobs"
        element={<AddJobForm job_application_backend="http://localhost:5000" />}
      />
      <Route path="applications" element={<Applications />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="projects" element={<Projects />} />
    </Routes>
  );
};

export default App;
