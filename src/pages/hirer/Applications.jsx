import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserData } from "../../context/UserContext";
import io from "socket.io-client";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:5000");

const Applications = () => {
  const { user } = UserData();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [scheduledTime, setScheduledTime] = useState(() => {
    // Set default value to current date and time in the correct format for datetime-local
    const now = new Date();
    return now.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
  });
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/applications/hirer",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setApplications(response.data);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching applications:", error);
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleAcceptApplication = async (applicationId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("No authentication token found. Please log in again.");
        navigate("/login");
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        { status: "Accepted" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Accept Application Response:", response.data);
      toast.success(response.data.message);

      if (response.data.isGoogleAuthenticated) {
        setSelectedApplicationId(applicationId);
        setShowScheduleModal(true);
      } else {
        toast.error("Redirecting to Google authentication...");
        window.location.href = `http://localhost:5000/api/auth/google?token=${token}`;
      }

      const updatedResponse = await axios.get(
        "http://localhost:5000/api/applications/hirer",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApplications(updatedResponse.data);
    } catch (error) {
      console.error("Error accepting application:", error);
      toast.error("Failed to accept application");
    }
  };

  const handleScheduleInterview = async () => {
    // Validate scheduledTime
    if (!scheduledTime) {
      toast.error("Please select a date and time for the interview.");
      return;
    }

    setScheduling(true);
    try {
      const token = localStorage.getItem("token");
      const formattedTime = new Date(scheduledTime).toISOString();

      const response = await axios.post(
        "http://localhost:5000/api/interviews",
        { applicationId: selectedApplicationId, scheduledTime: formattedTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message);
      if (response.data.meetLink) {
        toast.success(`Google Meet Link: ${response.data.meetLink}`, {
          duration: 10000, // Show the link for 10 seconds
        });
      }
      setShowScheduleModal(false);
      setSelectedApplicationId(null);
      setScheduledTime(() => {
        const now = new Date();
        return now.toISOString().slice(0, 16);
      });
    } catch (error) {
      console.error("Error scheduling interview:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to schedule interview";
      toast.error(errorMessage);
      // Close the modal if the error is related to email validation or Google authentication
      if (
        errorMessage.includes("Google access expired") ||
        errorMessage.includes("Failed to refresh Google access token") ||
        errorMessage.includes("Google authentication") ||
        error.response?.status === 401
      ) {
        toast.error("Google access expired. Redirecting to re-authenticate...");
        const token = localStorage.getItem("token");
        setTimeout(() => {
          window.location.href = `http://localhost:5000/api/auth/google?token=${token}`;
        }, 1500);
      }
    } finally {
      setScheduling(false);
    }
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setScheduledTime(() => {
      const now = new Date();
      return now.toISOString().slice(0, 16);
    });
  };

  const handleRejectApplication = async (appId, freelancerId) => {
    console.log("Button Clicked!");
    console.log("Application ID:", appId, "Freelancer ID:", freelancerId);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/applications/${appId}/status`,
        { status: "Rejected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        console.log("Application status updated successfully!");
        setApplications((prev) =>
          prev.map((app) =>
            app._id === appId ? { ...app, status: "Rejected" } : app
          )
        );

        socket.emit("applicationStatusUpdate", {
          freelancerId,
          message: "Unfortunately, your job application was rejected. 😔",
        });

        toast.success(`Application Rejected`);
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("Failed to reject application");
    }
  };
  // Add keyboard support to close modal with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showScheduleModal) {
        closeScheduleModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showScheduleModal]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (applications.length === 0) {
    return <p className="text-xl">No applications found for your jobs.</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Applications</h1>

      <div className="flex flex-col space-y-4">
        {applications.map((app) => (
          <div
            key={app._id}
            className="bg-white shadow rounded-lg p-4 flex flex-col md:flex-row"
          >
            <div className="flex-1 mr-4 mb-4 md:mb-0">
              <h2 className="font-semibold text-lg mb-1">
                {app.userId
                  ? `${app.userId.firstName} ${app.userId.lastName}`
                  : "N/A"}
              </h2>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Email:</span>{" "}
                {app.userId?.email || "N/A"}
              </p>
              {app.userId?.skills && (
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">Skills:</span>{" "}
                  {app.userId.skills.join(", ")}
                </p>
              )}
              {app.userId?.education && (
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">Education:</span>{" "}
                  {app.userId.education}
                </p>
              )}
              {app.userId?.linkedin && (
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">LinkedIn:</span>{" "}
                  <a
                    href={app.userId.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {app.userId.linkedin}
                  </a>
                </p>
              )}
              {app.userId?.github && (
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">GitHub:</span>{" "}
                  <a
                    href={app.userId.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {app.userId.github}
                  </a>
                </p>
              )}
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Applied for:</span>{" "}
                {app.jobId?.title || "N/A"}
              </p>
              {app.coverLetter && (
                <div className="mt-2">
                  <span className="font-semibold">Cover Letter:</span>
                  <p className="ml-2 text-gray-700 whitespace-pre-wrap">
                    {app.coverLetter}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center md:items-start space-y-3">
              {/* Accept and Reject Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleAcceptApplication(app._id)}
                  className="bg-green-600 text-white px-5 py-2 rounded-md shadow-sm hover:bg-green-700 active:bg-green-800 transition duration-200"
                >
                  Accept
                </button>
                <button
                  onClick={() =>
                    handleRejectApplication(app._id, app.userId._id)
                  }
                  className="bg-red-600 text-white px-5 py-2 rounded-md shadow-sm hover:bg-red-700 active:bg-red-800 transition duration-200"
                >
                  Reject
                </button>
              </div>

              {/* Download Resume Button */}
              {app.resume ? (
                <a
                  href={`http://localhost:5000/${app.resume}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-200 transition duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-2 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    ></path>
                  </svg>
                  <span>CV/Resume</span>
                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    PDF
                  </span>
                </a>
              ) : (
                <p className="text-red-500">No Resume</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showScheduleModal && (
        <div
          id="modal-background"
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeScheduleModal}
        >
          <div
            className="bg-white rounded-lg p-6 shadow-lg w-1/3 relative"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
          >
            <button
              onClick={closeScheduleModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4">Schedule Interview</h2>
            <div className="mb-4">
              <label
                htmlFor="schedule-time"
                className="block text-sm font-semibold text-[#1A2E46] mb-1"
              >
                Select Date and Time
              </label>
              <input
                id="schedule-time"
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="mt-1 block w-full p-2 border border-[#1A2E46] rounded-md shadow-sm focus:outline-none focus:ring-[#58A6FF] focus:border-[#58A6FF]"
                required
              />
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={closeScheduleModal}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleInterview}
                className="bg-[#58A6FF] hover:bg-[#1A2E46] text-white px-4 py-2 rounded-md transition"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
      {scheduling && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow text-center">
            <p className="text-lg font-semibold text-gray-800">
              Scheduling Interview...
            </p>
            <div className="mt-3 animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
