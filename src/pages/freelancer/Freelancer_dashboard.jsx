import React, { useEffect, useState } from "react";
import { UserData } from "../../context/UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileCompletionPopup from "./ProfileCompletionPopup";
import DefaultProfileImage from "../../assets/DefaultProfileImage.avif";
import JobApplicationForm from "./JobApplicationForm";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";

const FreelancerDashboard = () => {
  const { user, isAuth, refreshUser } = UserData();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Most Recent");
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate(); // Hook to handle navigation
  console.log(user.profilePicture);
  const [selectedJobId, setSelectedJobId] = useState(null); // Track the job ID for application
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    console.log("User data in FreelancerDashboard:", user);
  }, [user]);

  useEffect(() => {
    if (user && !user.isProfileComplete) {
      setShowPopup(true); // Show popup if the profile is incomplete
    } else {
      setShowPopup(false);
    }
  }, [user]);

  useEffect(() => {
    const fetchUserData = async () => {
      await refreshUser();
    };
    fetchUserData();
  }, []);

  const handlePopupClose = () => setShowPopup(false);

  const handlePopupComplete = () => {
    setShowPopup(false);
    navigate("/complete-profile"); // Navigate to the profile completion form
  };

  const handleApply = (jobId) => {
    console.log("Apply button clicked for job ID:", jobId);
    setSelectedJobId(jobId); // Set the selected job ID
    setShowApplicationForm(true); // Show the application form
    console.log("Show application form state:", true);
  };

  const closeApplicationForm = () => {
    setSelectedJobId(null);
    setShowApplicationForm(false);
  };

  // Fetch all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/jobs/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJobs(data.jobs);
        setFilteredJobs(data.jobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    if (isAuth && user) fetchJobs();
  }, [user, isAuth]);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:5000/api/saved-jobs",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Saved jobs:", data);
        setSavedJobs(data.map((job) => job.jobId._id)); // Store saved job IDs
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
      }
    };

    if (isAuth && user) fetchSavedJobs();
  }, [isAuth, user]);

  const handleSaveJob = async (jobId, isSaved) => {
    try {
      console.log("Saving Job ID:", jobId);
      const token = localStorage.getItem("token");
      if (isSaved) {
        await axios.delete(
          `http://localhost:5000/api/saved-jobs/unsave/${jobId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSavedJobs((prev) => prev.filter((id) => id !== jobId));
      } else {
        await axios.post(
          "http://localhost:5000/api/saved-jobs/save",
          { jobId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSavedJobs((prev) => [...prev, jobId]);
      }
    } catch (error) {
      console.error("Error saving/unsaving job:", error);
    }
  };

  useEffect(() => {
    let filtered = jobs;

    if (activeTab === "Most Recent") {
      filtered = jobs;
    } else if (activeTab === "Saved Jobs") {
      filtered = jobs.filter((job) => savedJobs.includes(job._id));
    } else if (activeTab === "Recommended") {
      filtered = jobs.filter((job) => job.recommended);
    }

    if (searchTerm) {
      filtered = filtered.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [searchTerm, jobs, activeTab, savedJobs]);

  return (
    <div>
      {showPopup && (
        <ProfileCompletionPopup
          onClose={handlePopupClose}
          onComplete={handlePopupComplete}
        />
      )}

      {/* Job Application Form */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
          <div className="bg-white rounded-lg p-6 shadow-lg w-3/4 max-w-5xl h-auto max-h-[90vh] overflow-y-auto">
            <JobApplicationForm
              jobId={selectedJobId}
              onClose={closeApplicationForm}
            />
          </div>
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={closeApplicationForm}
          >
            &times; {/* Close Button */}
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen p-6">
        {/* Main Section */}
        <div className="flex-grow lg:w-3/4 p-4">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">
            Welcome, {user?.firstName} {user?.lastName}!
          </h1>
          <h2 className="text-lg font-semibold text-gray-600">
            Search for Jobs
          </h2>

          {/* Search Filter */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search for jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6">
            {["Recommended", "Most Recent", "Saved Jobs"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === tab
                    ? "bg-[#58A6FF] text-white" // Active tab color
                    : "bg-gray-300 text-[#1A2E46]" // Inactive tab color
                } hover:bg-[#1A2E46] hover:text-white`} // Hover effect for tabs
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Stacked Job List */}
          <div className="mt-6 space-y-4">
            {filteredJobs.map((job) => {
              const isSaved = savedJobs.includes(job._id); // Check if the job is saved
              return (
                <div
                  key={job._id}
                  className="relative p-6 bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col"
                >
                  <div className="flex justify-end items-center space-x-3 mt-2">
                    {/* Save/Unsave Button */}
                    <button
                      onClick={() =>
                        handleSaveJob(job._id, isSaved, setSavedJobs)
                      }
                      className={`p-2 rounded-full transition-transform transform hover:scale-110 ${
                        isSaved
                          ? "bg-white text-[#58A6FF]"
                          : "bg-gray-300 text-[#1A2E46]"
                      }`}
                      title={isSaved ? "Unsave Job" : "Save Job"} // Tooltip
                    >
                      {isSaved ? (
                        <FaBookmark size={20} /> // Filled bookmark (saved)
                      ) : (
                        <FaRegBookmark size={20} /> // Outline bookmark (unsaved)
                      )}
                    </button>

                    {/* Apply Now Button */}
                    <button
                      onClick={() => handleApply(job._id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-[#58A6FF] text-white hover:bg-[#1A2E46] hover:text-white transition duration-300 ease-in-out"
                    >
                      Apply Now
                    </button>
                  </div>

                  {/* Job Details */}
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-700">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-500">{job.company}</p>
                    <p className="text-sm text-gray-500">{job.workplaceType}</p>
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
                    <p className="mt-2 text-gray-500">{job.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section: Profile */}
        <aside className="lg:w-1/4 p-4 bg-white shadow-md">
          <div className="text-center">
            <img
              src={
                user?.profilePicture
                  ? `http://localhost:5000/${user.profilePicture}`
                  : DefaultProfileImage
              }
              className="w-20 h-20 rounded-full mx-auto mb-4"
            />
            <h3 className="text-lg font-bold">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-sm text-gray-500">{user?.role}</p>
            <div className="flex flex-wrap space-x-2 mt-2">
              {user?.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
            <button className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
              Edit Profile
            </button>
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700">
              Availability
            </h4>
            <p className="text-sm text-green-500 mt-1">Available for work</p>
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700">Skills</h4>
            <div className="flex flex-wrap space-x-2 mt-2">
              {user?.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
