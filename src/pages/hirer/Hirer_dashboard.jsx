import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import axios from "axios";
import toast from "react-hot-toast";

const HirerDashboard = () => {
  const { user, isAuth, loading: contextLoading } = UserData();
  const navigate = useNavigate();
  const { id } = useParams();
  const [jobs, setJobs] = useState([]);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteJobId, setDeleteJobId] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [scheduledTime, setScheduledTime] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    if (token) {
      console.log("Token received in HirerDashboard:", token);
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const fetchJobsAndApplications = async () => {
      try {
        const token = localStorage.getItem("token");

        const jobsResponse = await axios.get(
          "http://localhost:5000/api/jobs/added-by-you",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const applicationsResponse = await axios.get(
          "http://localhost:5000/api/applications/hirer",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setJobs(jobsResponse.data.jobs);
        setApplications(applicationsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch jobs or applications");
        setLoading(false);
      }
    };

    if (isAuth && user && !contextLoading) {
      fetchJobsAndApplications();
    }
  }, [user, isAuth, contextLoading]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/jobs/${deleteJobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Job deleted successfully!");
      setJobs(jobs.filter((job) => job._id !== deleteJobId));
      setDeleteJobId(null);
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete the job.");
      setDeleteJobId(null);
    }
  };

  const handleAcceptApplication = async (applicationId) => {
    try {
      const token = localStorage.getItem("token");
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
        toast.error(
          "Please authenticate with Google to schedule an interview."
        );
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
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/interviews",
        { applicationId: selectedApplicationId, scheduledTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      setShowScheduleModal(false);
      setScheduledTime("");
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast.error("Failed to schedule interview");
    }
  };

  const closeModal = () => {
    setDeleteJobId(null);
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setScheduledTime("");
  };

  if (contextLoading || loading) {
    return <p>Loading...</p>;
  }

  if (!isAuth || !user) {
    return <p>Redirecting to login...</p>;
  }

  // Redirect if the URL id doesn't match the user._id
  if (id !== user._id) {
    navigate(`/hirer/${user._id}`, { replace: true });
    return null;
  }

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">
          Welcome, {user.firstName} {user.lastName}!
        </h1>
      </header>

      <div>
        <h2 className="text-xl font-semibold mb-4">Jobs Added by You</h2>
        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="flex flex-col md:flex-row items-start bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 w-full"
              >
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
                  <p className="text-sm text-gray-500">
                    Company: {job.company}
                  </p>
                  <p className="text-sm text-gray-500">
                    Workplace Type: {job.workplaceType}
                  </p>
                  <p className="text-sm text-gray-500">
                    Location: {job.location}
                  </p>
                  <p className="text-sm text-gray-500">
                    Job Type: {job.jobType}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <p className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-full">
                      Category: {job.category}
                    </p>
                    <p className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-full">
                      Subcategory: {job.subCategory}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {job.description}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Posted by: {job.hirer.firstName} {job.hirer.lastName}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 md:ml-6 flex space-x-4 items-center">
                  <button
                    onClick={() => setDeleteJobId(job._id)}
                    className="flex items-center bg-transparent hover:bg-red-100 text-red-600 font-semibold py-2 px-4 border border-red-400 rounded hover:border-red-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 3H15C15.55 3 16 3.45 16 4V5H19C19.55 5 20 5.45 20 6C20 6.55 19.55 7 19 7H5C4.45 7 4 6.55 4 6C4 5.45 4.45 5 5 5H8V4C8 3.45 8.45 3 9 3ZM10 9C10.55 9 11 9.45 11 10V16C11 16.55 10.55 17 10 17C9.45 17 9 16.55 9 16V10C9 9.45 9.45 9 10 9ZM14 9C14.55 9 15 9.45 15 10V16C15 16.55 14.55 17 14 17C13.45 17 13 16.55 13 16V10C13 9.45 13.45 9 14 9ZM6 8H18V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V8Z" />
                    </svg>
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      console.log("Navigating with job:", job);
                      navigate(`/hirer/${user._id}/edit-job`, {
                        state: { job },
                      });
                    }}
                    className="bg-[#5EA3EF] text-white font-semibold py-2 px-4 rounded hover:bg-[#1A2E46]"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-500">You haven’t posted any jobs yet.</p>
            <button
              onClick={() => navigate(`/hirer/${user._id}/add-jobs`)}
              className="mt-4 px-4 py-2 bg-[#58A6FF] text-white rounded-md hover:bg-[#1A2E46]"
            >
              Post Now
            </button>
          </div>
        )}
      </div>

      {/* <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Applications Received</h2>
        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="flex flex-col md:flex-row items-start bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 w-full"
              >
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold mb-2">
                    {app.jobId.title} - {app.userId.firstName}{" "}
                    {app.userId.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Email: {app.userId.email}
                  </p>
                  <p className="text-sm text-gray-500">Status: {app.status}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Cover Letter: {app.coverLetter}
                  </p>
                  {app.resume && (
                    <a
                      href={`http://localhost:5000${app.resume}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline text-sm"
                    >
                      View Resume
                    </a>
                  )}
                </div>
                <div className="mt-4 md:mt-0 md:ml-6 flex space-x-4 items-center">
                  {app.status === "Pending" && (
                    <button
                      onClick={() => handleAcceptApplication(app._id)}
                      className="bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600"
                    >
                      Accept
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-500">No applications received yet.</p>
          </div>
        )}
      </div> */}

      {deleteJobId && (
        <div
          id="modal-background"
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeModal}
        >
          <div className="bg-white rounded-lg p-6 shadow-lg w-1/3 relative">
            <button
              onClick={() => setDeleteJobId(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this job?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteJobId(null)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div
          id="modal-background"
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeScheduleModal}
        >
          <div className="bg-white rounded-lg p-6 shadow-lg w-1/3 relative">
            <button
              onClick={closeScheduleModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4">Schedule Interview</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Select Date and Time
              </label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#58A6FF] focus:border-[#58A6FF]"
                required
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeScheduleModal}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleInterview}
                className="bg-[#58A6FF] text-white px-4 py-2 rounded-md hover:bg-[#1A2E46]"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HirerDashboard;
