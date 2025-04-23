import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserData } from "../../context/UserContext";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { FiCheckCircle } from "react-icons/fi";

const AcceptedApplications = () => {
  const { user } = UserData();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createProjectModal, setCreateProjectModal] = useState(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectDuration, setProjectDuration] = useState("");
  const [projectDeadline, setProjectDeadline] = useState("");
  const [projectPayment, setProjectPayment] = useState(""); // Changed to projectPayment

  useEffect(() => {
    const fetchAcceptedApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/applications/hirer/accepted",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setApplications(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching accepted applications:", error);
        setLoading(false);
        toast.error("Failed to fetch accepted applications.");
      }
    };

    fetchAcceptedApplications();
  }, [user]);

  const handleConfirmHire = async (applicationId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/applications/${applicationId}/confirm-hire`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: "Hired" } : app
        )
      );
      toast.success("Freelancer hired successfully!");
    } catch (err) {
      console.error("Error confirming hire:", err);
      toast.error("Failed to confirm hire.");
    }
  };

  const handleCreateProject = async (applicationId) => {
    if (!projectTitle.trim()) {
      toast.error("Project title is required.");
      return;
    }
    if (!projectPayment.trim()) {
      toast.error("Project payment is required.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const application = applications.find((app) => app._id === applicationId);
      const interview = application.interview;
      const res = await axios.post(
        "http://localhost:5000/api/projects",
        {
          interviewId: interview._id,
          title: projectTitle,
          description: projectDescription,
          duration: projectDuration ? parseInt(projectDuration) : undefined,
          deadline: projectDeadline ? new Date(projectDeadline) : undefined,
          payment: projectPayment ? parseFloat(projectPayment) : undefined, // Changed to payment
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId
            ? { ...app, interview: { ...app.interview, projectCreated: true } }
            : app
        )
      );
      setCreateProjectModal(null);
      setProjectTitle("");
      setProjectDescription("");
      setProjectDuration("");
      setProjectDeadline("");
      setProjectPayment(""); // Changed to projectPayment
      toast.success("Project created successfully!");
    } catch (err) {
      console.error("Error creating project:", err);
      toast.error("Failed to create project.");
    }
  };

  const ApplicationCard = ({ application }) => {
    const jobTitle = application.jobId.title || "N/A";
    const freelancer = application.userId;

    return (
      <div className="bg-white rounded-xl shadow p-5 border flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[#1A2E46]">{jobTitle}</h2>
          <span
            className={`text-sm px-3 py-1 rounded-full ${
              application.status === "Hired"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {application.status}
          </span>
        </div>
        <p>
          <span className="font-semibold">Freelancer:</span>{" "}
          {freelancer.firstName ?? "N/A"} {freelancer.lastName ?? ""} (
          {freelancer.email ?? "N/A"})
        </p>
        <p>
          <span className="font-semibold">Interview Scheduled:</span>{" "}
          {format(new Date(application.interview.scheduledTime), "PPPpp", {
            timeZone: "Asia/Kathmandu",
          })}
        </p>
        <div className="flex space-x-2">
          {application.status !== "Hired" && (
            <button
              onClick={() => handleConfirmHire(application._id)}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
            >
              <FiCheckCircle className="mr-2" />
              Confirm Hire
            </button>
          )}
          {application.status === "Hired" &&
            !application.interview.projectCreated && (
              <button
                onClick={() => setCreateProjectModal(application)}
                className="bg-[#58A6FF] text-white px-4 py-2 rounded-md hover:bg-[#1A2E46] transition flex items-center"
              >
                <FiCheckCircle className="mr-2" />
                Create Project
              </button>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Accepted Applications</h1>
      {loading ? (
        <p>Loading applications...</p>
      ) : applications.length === 0 ? (
        <p>No accepted applications with completed interviews found.</p>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => (
            <ApplicationCard key={application._id} application={application} />
          ))}
        </div>
      )}

      {createProjectModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-[#1A2E46]">
              Create Project for {createProjectModal.jobId.title}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Project Title
              </label>
              <input
                type="text"
                className="w-full border p-2 rounded mt-1"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Enter project title"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                className="w-full border p-2 rounded mt-1"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Enter project description"
                rows="3"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Duration (Days, Optional)
              </label>
              <input
                type="number"
                className="w-full border p-2 rounded mt-1"
                value={projectDuration}
                onChange={(e) => setProjectDuration(e.target.value)}
                placeholder="Enter duration in days"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Deadline (Optional)
              </label>
              <input
                type="date"
                className="w-full border p-2 rounded mt-1"
                value={projectDeadline}
                onChange={(e) => setProjectDeadline(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Project Payment (NPR)
              </label>
              <input
                type="number"
                className="w-full border p-2 rounded mt-1"
                value={projectPayment}
                onChange={(e) => setProjectPayment(e.target.value)}
                placeholder="Enter payment in NPR"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setCreateProjectModal(null);
                  setProjectTitle("");
                  setProjectDescription("");
                  setProjectDuration("");
                  setProjectDeadline("");
                  setProjectPayment(""); // Changed to projectPayment
                }}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateProject(createProjectModal._id)}
                className="bg-[#58A6FF] hover:bg-[#1A2E46] text-white px-4 py-2 rounded-md transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcceptedApplications;
