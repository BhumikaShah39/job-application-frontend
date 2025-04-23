import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { UserData } from "../context/UserContext";
import PaymentModal from "./PaymentPage";

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = UserData();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/projects/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProject(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch project.");
        setLoading(false);
        toast.error("Failed to fetch project details.");
      }
    };

    if (user) {
      fetchProject();
    }
  }, [id, user]);

  const handleMarkAsCompleted = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/projects/${id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProject((prev) => ({
        ...prev,
        status: "Completed",
      }));
      if (res.data.paymentSetupRequired) {
        toast.error("Please set up your payment information to proceed.");
        navigate(`/hirer/${user._id}/payment-setup`);
      } else if (res.data.paymentPending) {
        toast.success(
          "Project marked as completed. Freelancer has been notified to set up payment information."
        );
      } else {
        toast.success("Project marked as completed and payment initiated!");
      }
    } catch (error) {
      console.error("Error marking project as completed:", error);
      toast.error("Failed to mark project as completed.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error || !project) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-600 mb-4">{error || "Project not found."}</p>
        <button
          onClick={() =>
            navigate(
              user.role === "hirer"
                ? `/hirer/${user._id}/projects`
                : `/user/${user._id}/projects`
            )
          }
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <nav className="mb-4 text-sm text-gray-600">
        <ol className="list-none p-0 inline-flex">
          <li className="flex items-center">
            <Link
              to={
                user.role === "hirer"
                  ? `/hirer/${user._id}/projects`
                  : `/user/${user._id}/projects`
              }
              className="text-[#1A2E46] hover:text-[#58A6FF]"
            >
              Projects
            </Link>
            <span className="mx-2">/</span>
          </li>
          <li className="flex items-center">
            <span className="text-gray-500">{project.title}</span>
          </li>
        </ol>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#1A2E46]">
          {project.title}
        </h1>
        {(user.role === "hirer" || user.role === "user") && (
          <Link
            to={`/projects/${id}/task-board`}
            className="bg-[#58A6FF] text-white px-4 py-2 rounded-md hover:bg-[#3366CC] transition"
          >
            View Task Board
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">Status:</span>{" "}
          <span
            className={
              project.status === "Completed"
                ? "text-blue-700"
                : "text-yellow-600"
            }
          >
            {project.status}
          </span>
        </p>
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">Duration:</span>{" "}
          {project.duration ? `${project.duration} days` : "Not specified"}
        </p>
        <p className="text-gray-600">
          <span className="font-semibold">Deadline:</span>{" "}
          {project.deadline
            ? format(new Date(project.deadline), "PPP")
            : "Not specified"}
        </p>
      </div>

      {user.role === "hirer" && (
        <div className="flex justify-end">
          <button
            onClick={handleMarkAsCompleted}
            disabled={project.status === "Completed"}
            className={`px-4 py-2 rounded-md text-white font-medium transition ${
              project.status === "Completed"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {project.status === "Completed"
              ? "Project Completed"
              : "Mark as Completed"}
          </button>
        </div>
      )}

      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={5000} // Replace with dynamic amount from project data
          projectId={id}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default ProjectDetails;
