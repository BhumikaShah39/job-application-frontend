// job-application-frontend/src/pages/freelancer/Freelancer_dashboard.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { UserData } from "../../context/UserContext";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import ProfileCompletionPopup from "./ProfileCompletionPopup";
import DefaultProfileImage from "../../assets/DefaultProfileImage.avif";
import JobApplicationForm from "./JobApplicationForm";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import {
  FaChevronDown,
  FaChevronUp,
  FaFilter,
  FaHistory,
} from "react-icons/fa";

const categories = [
  "Technology",
  "Design",
  "Marketing",
  "Writing",
  "Business",
  "Education",
  "Media",
];

const FreelancerDashboard = () => {
  const { user, isAuth, refreshUser } = UserData();
  const [jobs, setJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("Most Recent");
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [hasFetchedRecommended, setHasFetchedRecommended] = useState(false);
  const [errorRecommended, setErrorRecommended] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [hasFetchedJobs, setHasFetchedJobs] = useState(false);
  const [showHirerModal, setShowHirerModal] = useState(false);
  const [selectedHirer, setSelectedHirer] = useState(null);

  useEffect(() => {
    if (user && !user.isProfileComplete) {
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, [user]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      await refreshUser(token);
    };
    fetchUserData();
  }, [refreshUser]);

  const handlePopupClose = () => setShowPopup(false);

  const handlePopupComplete = () => {
    setShowPopup(false);
    navigate("/complete-profile");
  };

  const handleApply = (jobId) => {
    console.log("Apply button clicked for job ID:", jobId);
    setSelectedJobId(jobId);
    setShowApplicationForm(true);
    console.log("Show application form state:", true);
  };

  const closeApplicationForm = () => {
    setSelectedJobId(null);
    setShowApplicationForm(false);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/jobs/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJobs(data.jobs);
        setFilteredJobs(data.jobs);
        setHasFetchedJobs(true);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoadingJobs(false);
      }
    };

    if (isAuth && user && !hasFetchedJobs) {
      fetchJobs();
    }
  }, [user, isAuth, hasFetchedJobs]);

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
        setSavedJobs(data.map((job) => job.jobId._id));
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

  const fetchRecommendedJobs = async () => {
    try {
      setLoadingRecommended(true);
      setErrorRecommended(null);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found, user is not authenticated.");
        setErrorRecommended("Please log in to view recommended jobs.");
        return;
      }

      console.log("Fetching recommended jobs for user:", user?._id);
      const { data } = await axios.get(
        "http://localhost:5000/api/recommendations/recommended",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Recommended Jobs Response:", data);
      setRecommendedJobs(data.recommendedJobs || []);
      setHasFetchedRecommended(true);
    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = "Failed to fetch recommended jobs";
      if (errorData) {
        if (errorData.details) {
          errorMessage = errorData.details.includes("Cast to ObjectId failed")
            ? "An error occurred due to invalid job data. Please try again later."
            : errorData.details;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else {
        errorMessage = error.message || errorMessage;
      }
      console.error(
        "Error fetching recommended jobs:",
        errorData || error.message
      );
      setErrorRecommended(errorMessage);
      setRecommendedJobs([]);
    } finally {
      setLoadingRecommended(false);
    }
  };

  useEffect(() => {
    if (
      isAuth &&
      user &&
      activeTab === "Recommended" &&
      !hasFetchedRecommended
    ) {
      fetchRecommendedJobs();
    }
  }, [isAuth, user, activeTab, hasFetchedRecommended]);

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "http://localhost:5000/api/jobs/search",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            searchTerm,
            categories: selectedCategory ? [selectedCategory] : [],
            sortBy,
          },
        }
      );

      console.log("Search API Response:", data);
      setFilteredJobs(data.jobs);
      setHasFetchedRecommended(false);
    } catch (error) {
      console.error("Error fetching filtered jobs:", error);
    }
  };

  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const displayedJobs = useMemo(() => {
    let filtered;

    if (activeTab === "Most Recent") {
      filtered = jobs;
    } else if (activeTab === "Saved Jobs") {
      filtered = jobs.filter((job) => savedJobs.includes(job._id));
    } else if (activeTab === "Recommended") {
      filtered = recommendedJobs;
    }

    if (searchTerm) {
      filtered = filtered.filter((job) =>
        [
          job.title?.toLowerCase(),
          job.company?.toLowerCase(),
          job.location?.toLowerCase(),
        ].some((field) => field?.includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((job) => job.category === selectedCategory);
    }

    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortBy === "newest" ? dateB - dateA : dateA - dateB;
      });
    }

    return filtered || [];
  }, [
    searchTerm,
    selectedCategory,
    sortBy,
    jobs,
    activeTab,
    savedJobs,
    recommendedJobs,
  ]);

  useEffect(() => {
    const fetchSearchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:5000/api/jobs/search-history",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Fetched Search History:", data.searchHistory);
        setSearchHistory(data.searchHistory || []);
      } catch (error) {
        console.error("Error fetching search history:", error);
      }
    };

    if (isAuth) fetchSearchHistory();
  }, [isAuth]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length > 0) {
      setShowHistory(true);
    }
  };

  const selectSearchTerm = (term) => {
    setSearchTerm(term);
    setShowHistory(false);
  };

  const handleViewHirer = (hirer) => {
    setSelectedHirer(hirer);
    setShowHirerModal(true);
  };

  const closeHirerModal = () => {
    setShowHirerModal(false);
    setSelectedHirer(null);
  };

  return (
    <div>
      {showPopup && (
        <ProfileCompletionPopup
          onClose={handlePopupClose}
          onComplete={handlePopupComplete}
        />
      )}

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
            ×
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen p-6">
        <div className="flex-grow lg:w-3/4 p-4">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">
            Welcome, {user?.firstName} {user?.lastName}!
          </h1>
          <h2 className="text-lg font-semibold text-gray-600">
            Search for Jobs
          </h2>

          <div className="flex items-center gap-4 mb-6 relative">
            <div ref={searchRef} className="relative w-full lg:w-1/2">
              <input
                type="text"
                placeholder="Search by job title, company name, or location..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              />

              {showHistory && searchHistory.length > 0 && (
                <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg rounded-md mt-1 z-50 overflow-hidden">
                  {searchHistory.map((history, index) => (
                    <li
                      key={index}
                      onClick={() => selectSearchTerm(history.searchTerm)}
                      className="flex items-center p-3 cursor-pointer hover:bg-gray-200 transition-all"
                    >
                      <FaHistory className="text-gray-500 mr-2" />{" "}
                      {history.searchTerm}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-[#58A6FF] text-white rounded-md hover:bg-[#1A2E46] focus:outline-none"
              >
                <FaFilter />
                Filters
                {showFilters ? <FaChevronUp /> : <FaChevronDown />}
              </button>

              {showFilters && (
                <div className="absolute left-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-3 z-20">
                  <h3 className="text-sm font-bold text-gray-700 mb-2">
                    Categories
                  </h3>
                  <ul>
                    {categories.map((category) => (
                      <li
                        key={category}
                        className={`p-2 hover:bg-gray-200 cursor-pointer ${
                          selectedCategory === category
                            ? "font-bold text-[#58A6FF]"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedCategory((prev) =>
                            prev === category ? "" : category
                          );
                          setShowFilters(false);
                        }}
                      >
                        {category}
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-sm font-bold text-gray-700 mt-3 mb-2">
                    Sort By
                  </h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-[#58A6FF] text-white rounded-md hover:bg-[#1A2E46]"
            >
              Search
            </button>
          </div>

          <div className="flex space-x-4 mb-6">
            {["Recommended", "Most Recent", "Saved Jobs"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === tab
                    ? "bg-[#58A6FF] text-white"
                    : "bg-gray-300 text-[#1A2E46]"
                } hover:bg-[#1A2E46] hover:text-white`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {activeTab === "Recommended" && loadingRecommended ? (
              <p className="text-gray-500 text-center">
                Loading recommended jobs...
              </p>
            ) : activeTab === "Recommended" && errorRecommended ? (
              <p className="text-red-500 text-center">{errorRecommended}</p>
            ) : (activeTab === "Most Recent" || activeTab === "Saved Jobs") &&
              loadingJobs ? (
              <p className="text-gray-500 text-center">Loading jobs...</p>
            ) : displayedJobs.length > 0 ? (
              displayedJobs.map((job) => {
                const isSaved = savedJobs.includes(job._id);
                return (
                  <div
                    key={job._id}
                    className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col md:flex-row"
                  >
                    <div className="flex items-center mr-4 mb-4 md:mb-0">
                      <img
                        src={
                          job.hirer?.profilePicture
                            ? `http://localhost:5000/${job.hirer.profilePicture}`
                            : DefaultProfileImage
                        }
                        alt="Hirer Profile"
                        className="w-16 h-16 rounded-full cursor-pointer"
                        onClick={() => handleViewHirer(job.hirer)}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-700">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gray-500">{job.company}</p>
                      <p className="text-sm text-gray-500">
                        Posted by: {job.hirer?.firstName} {job.hirer?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {job.workplaceType}
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

                      <p className="mt-2 text-gray-600">{job.description}</p>
                      <p className="mt-2 text-gray-600">
                        Rating:{" "}
                        {job.hirer?.ratings?.length > 0
                          ? "Rated"
                          : "Not rated yet"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end space-y-3 mt-4 md:mt-0">
                      <button
                        onClick={() => handleSaveJob(job._id, isSaved)}
                        className={`p-2 rounded-full transition-transform transform hover:scale-110 ${
                          isSaved
                            ? "bg-blue-500 text-white"
                            : "bg-gray-300 text-gray-700"
                        }`}
                        title={isSaved ? "Unsave Job" : "Save Job"}
                      >
                        {isSaved ? (
                          <FaBookmark size={20} />
                        ) : (
                          <FaRegBookmark size={20} />
                        )}
                      </button>

                      <button
                        onClick={() => handleApply(job._id)}
                        className="px-3 py-1 bg-[#58A6FF] text-white rounded-md hover:bg-[#1A2E46] transition text-sm font-medium"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center">No jobs found.</p>
            )}
          </div>
        </div>

        <aside className="lg:w-1/4 p-4 bg-white shadow-md sticky top-6 min-h-screen flex flex-col">
          <div className="text-center">
            <img
              src={
                user?.profilePicture
                  ? `http://localhost:5000/${user.profilePicture.replace(
                      /\\/g,
                      "/"
                    )}`
                  : DefaultProfileImage
              }
              className="w-20 h-20 rounded-full mx-auto mb-4"
              alt="Profile"
            />
            <h3 className="text-lg font-bold">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-sm text-gray-500">{user?.role}</p>
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700">Skills</h4>
              <div className="flex flex-wrap justify-center space-x-2 mt-2">
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
            <div className="mt-4 space-y-2">
              <Link
                to={`/user/${user?._id}/edit-account`}
                className="block px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Edit Account
              </Link>
              <Link
                to={`/user/${user?._id}/add-enhancements`}
                className="block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Enhancements
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Hirer Details Modal */}
      {showHirerModal && selectedHirer && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeHirerModal}
        >
          <div
            className="bg-white rounded-lg p-6 shadow-lg w-1/2 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeHirerModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              aria-label="Close modal"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4">Hirer Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <img
                  src={
                    selectedHirer.profilePicture
                      ? `http://localhost:5000/${selectedHirer.profilePicture}`
                      : DefaultProfileImage
                  }
                  alt="Hirer Profile"
                  className="w-24 h-24 rounded-full mr-4"
                />
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedHirer.firstName} {selectedHirer.lastName}
                  </h3>
                  <p className="text-gray-600">{selectedHirer.email}</p>
                </div>
              </div>
              {selectedHirer.businessDetails && (
                <div>
                  <h4 className="font-semibold">Business Details</h4>
                  <p>Company: {selectedHirer.businessDetails.companyName}</p>
                  <p>Industry: {selectedHirer.businessDetails.industry}</p>
                  <p>
                    Description: {selectedHirer.businessDetails.description}
                  </p>
                  {selectedHirer.businessDetails.website && (
                    <p>
                      Website:{" "}
                      <a
                        href={selectedHirer.businessDetails.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {selectedHirer.businessDetails.website}
                      </a>
                    </p>
                  )}
                </div>
              )}
              {selectedHirer.pastWork?.length > 0 && (
                <div>
                  <h4 className="font-semibold">Past Work</h4>
                  {selectedHirer.pastWork.map((work, index) => (
                    <div key={index} className="mb-2">
                      <p>{work.title}</p>
                      <p>{work.description}</p>
                      <p>Duration: {work.duration}</p>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <h4 className="font-semibold">Rating</h4>
                <p>
                  {selectedHirer.ratings?.length > 0
                    ? "Rated (rating system to be implemented)"
                    : "Not rated yet"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerDashboard;
