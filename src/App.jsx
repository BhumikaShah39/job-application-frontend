import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Home from "./pages/Home";
import Header from "./Components/layouts/Header";
import Footer from "./Components/footer/Footer";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import FreelancerDashboard from "./pages/freelancer/Freelancer_dashboard";
import CompleteProfileForm from "./pages/freelancer/CompleteProfileForm";
import HirerDashboard from "./pages/hirer/Hirer_dashboard";
import AddJobForm from "./pages/hirer/AddJobForm";
import Applications from "./pages/hirer/Applications";
import AcceptedApplications from "./pages/hirer/AcceptedApplications";
import Analytics from "./pages/hirer/Analytics";
import AdminDashboard from "./pages/admin/Admin_dashboard";
import ManageMembers from "./pages/admin/ManageMembers";
import ManagePosts from "./pages/admin/ManagePosts";
import Notifications from "./pages/Notifications";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import TaskBoard from "./pages/TaskBoard";
import PaymentPage from "./pages/PaymentPage";
import FreelancerLayout from "./Components/layouts/FreelancerLayout";
import HirerLayout from "./Components/layouts/HirerLayout";
import AdminLayout from "./Components/layouts/AdminLayout";
import RoleBasedLayout from "./Components/layouts/RoleBasedLayout";
import PrivateRoute from "./Components/PrivateRoute";
import { UserContextProvider, UserData } from "./context/UserContext";
import MyApplications from "./pages/freelancer/MyApplications";
import FreelancerAnalytics from "./pages/freelancer/FreelancerAnalytics"; // New import
import ScheduledMeetings from "./pages/ScheduledMeetings";
import { NotificationProvider } from "./context/NotificationContext";

const stripePromise = loadStripe(
  "pk_test_51RBwkS4ERPs70rNrlWi7xFEyIitr8ANpsVWPYfXQ0Urav38HLPKKf8Jcj6kbcgOJpnDvHl0476MH4BRpkP3nqQoh00ImNwgLuB"
);

function App() {
  const { user, isAuth, loading } = UserData();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <UserContextProvider>
        <NotificationProvider>
          <Elements stripe={stripePromise}>
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
                  <Route
                    path="/user/:id/applications"
                    element={
                      <PrivateRoute allowedRoles={["user"]}>
                        <FreelancerLayout>
                          <MyApplications />
                        </FreelancerLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/user/:id/analytics"
                    element={
                      <PrivateRoute allowedRoles={["user"]}>
                        <FreelancerLayout>
                          <FreelancerAnalytics />
                        </FreelancerLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/user/:id/scheduled-meetings"
                    element={
                      <PrivateRoute allowedRoles={["user"]}>
                        <FreelancerLayout>
                          <ScheduledMeetings />
                        </FreelancerLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/user/:id/projects"
                    element={
                      <PrivateRoute allowedRoles={["user"]}>
                        <FreelancerLayout>
                          <Projects />
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
                    path="/hirer/:id/applications/accepted"
                    element={
                      <PrivateRoute allowedRoles={["hirer"]}>
                        <HirerLayout>
                          <AcceptedApplications />
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
                  <Route
                    path="/hirer/:id/scheduled-meetings"
                    element={
                      <PrivateRoute allowedRoles={["hirer"]}>
                        <HirerLayout>
                          <ScheduledMeetings />
                        </HirerLayout>
                      </PrivateRoute>
                    }
                  />

                  {/* Project Routes */}
                  <Route
                    path="/projects/:id"
                    element={
                      <PrivateRoute allowedRoles={["user", "hirer"]}>
                        <RoleBasedLayout>
                          <ProjectDetails />
                        </RoleBasedLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/projects/:id/task-board"
                    element={
                      <PrivateRoute allowedRoles={["user", "hirer"]}>
                        <RoleBasedLayout>
                          <TaskBoard />
                        </RoleBasedLayout>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/projects/:id/payment"
                    element={
                      <PrivateRoute allowedRoles={["user", "hirer"]}>
                        <RoleBasedLayout>
                          <PaymentPage />
                        </RoleBasedLayout>
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
                    path="/admin/dashboard"
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

                  <Route
                    path="*"
                    element={
                      <>
                        <Header />
                        <div className="flex min-h-screen items-center justify-center">
                          <h2 className="text-2xl font-bold">
                            404 - Page Not Found
                          </h2>
                        </div>
                      </>
                    }
                  />
                </Routes>
              </div>
              <Footer />
            </div>
          </Elements>
        </NotificationProvider>
      </UserContextProvider>
    </Router>
  );
}

export default App;
