import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Header from "./Components/layouts/Header"; // For unauthenticated
import Footer from "./Components/footer/Footer";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import FreelancerDashboard from "./pages/freelancer/Freelancer_dashboard";
import CompleteProfileForm from "./pages/freelancer/CompleteProfileForm";
import HirerDashboard from "./pages/hirer/Hirer_dashboard";
import AddJobForm from "./pages/hirer/AddJobForm";
import Applications from "./pages/hirer/Applications";
import Analytics from "./pages/hirer/Analytics";
import AdminDashboard from "./pages/admin/Admin_dashboard";
import ManageMembers from "./pages/admin/ManageMembers";
import ManagePosts from "./pages/admin/ManagePosts";
import Notifications from "./pages/Notifications";
import Projects from "./pages/Projects";

import FreelancerLayout from "./Components/layouts/FreelancerLayout";
import HirerLayout from "./Components/layouts/HirerLayout";
import AdminLayout from "./Components/layouts/AdminLayout";

import PrivateRoute from "./Components/PrivateRoute";
import { UserData } from "./context/UserContext";

function App() {
  const { user, isAuth } = UserData();

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Header />
                  <Home />
                </>
              }
            />
            <Route
              path="/login"
              element={
                <>
                  <Header />
                  <Login />
                </>
              }
            />
            <Route
              path="/register"
              element={
                <>
                  <Header />
                  <Register />
                </>
              }
            />

            {/* FREELANCER Routes */}
            <Route
              path="/user/:id"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <FreelancerLayout>
                    <FreelancerDashboard />
                  </FreelancerLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/complete-profile"
              element={
                <PrivateRoute allowedRoles={["user"]}>
                  <FreelancerLayout>
                    <CompleteProfileForm />
                  </FreelancerLayout>
                </PrivateRoute>
              }
            />

            {/* HIRER Routes */}
            <Route
              path="/hirer/:id"
              element={
                <PrivateRoute allowedRoles={["hirer"]}>
                  <HirerLayout>
                    <HirerDashboard />
                  </HirerLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/hirer/:id/add-jobs"
              element={
                <PrivateRoute allowedRoles={["hirer"]}>
                  <HirerLayout>
                    <AddJobForm job_application_backend="http://localhost:5000" />
                  </HirerLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/hirer/:id/edit-job"
              element={
                <PrivateRoute allowedRoles={["hirer"]}>
                  <HirerLayout>
                    <AddJobForm job_application_backend="http://localhost:5000" />
                  </HirerLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/hirer/:id/applications"
              element={
                <PrivateRoute allowedRoles={["hirer"]}>
                  <HirerLayout>
                    <Applications />
                  </HirerLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/hirer/:id/analytics"
              element={
                <PrivateRoute allowedRoles={["hirer"]}>
                  <HirerLayout>
                    <Analytics />
                  </HirerLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/hirer/:id/notifications"
              element={
                <PrivateRoute allowedRoles={["hirer"]}>
                  <HirerLayout>
                    <Notifications />
                  </HirerLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/hirer/:id/projects"
              element={
                <PrivateRoute allowedRoles={["hirer"]}>
                  <HirerLayout>
                    <Projects />
                  </HirerLayout>
                </PrivateRoute>
              }
            />

            {/* ADMIN Routes */}
            <Route
              path="/admin/:id"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/manage-members"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminLayout>
                    <ManageMembers />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/manage-posts"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminLayout>
                    <ManagePosts />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
        {/* Always show Footer at bottom */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
