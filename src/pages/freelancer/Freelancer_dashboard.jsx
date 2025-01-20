import React, { useEffect, useState } from "react";
import { UserData } from "../../context/UserContext";
import axios from "axios";

const FreelancerDashboard = () => {
  const { user, isAuth } = UserData();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Recent");

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
    let filtered = jobs;

    if (activeTab === "Recent") {
      filtered = jobs;
    } else if (activeTab === "Featured") {
      filtered = jobs.filter((job) => job.featured);
    } else if (activeTab === "Recommended") {
      filtered = jobs.filter((job) => job.recommended);
    }

    if (searchTerm) {
      filtered = filtered.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [searchTerm, jobs, activeTab]);

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen p-6">
      {/* Main Section */}
      <div className="flex-grow lg:w-3/4 p-4">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">
          Welcome, {user?.firstName} {user?.lastName}!
        </h1>
        <h2 className="text-lg font-semibold text-gray-600">Search for Jobs</h2>

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
          {["Recommended", "Featured", "Recent"].map((tab) => (
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
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              className="relative p-6 bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col"
            >
              {/* Apply Now Button */}
              <button
                onClick={() => navigate(`/hirer/${user._id}/jobs/${job._id}`)}
                className="absolute top-4 right-4 px-4 py-2 bg-[#58A6FF] text-white rounded-md hover:bg-[#1A2E46] whitespace-nowrap"
              >
                Apply Now
              </button>

              {/* Job Details */}
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-700">{job.title}</h3>
                <p className="text-sm text-gray-500">{job.company}</p>
                <p className="text-sm text-gray-500">{job.workplaceType}</p>
                <p className="text-sm text-gray-500">
                  Location: {job.location}
                </p>
                <p className="text-sm text-gray-500">Job Type: {job.jobType}</p>
                <div className="flex space-x-2 mt-2">
                  <p className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-full">
                    Category: {job.category}
                  </p>
                  <p className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-full">
                    Subcategory: {job.subCategory}
                  </p>
                </div>
                <div className="flex space-x-2 mt-2">
                  {job.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-gray-500">{job.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section: Profile */}
      <aside className="lg:w-1/4 p-4 bg-white shadow-md">
        <div className="text-center">
          <img
            src={user?.profilePicture || ""}
            alt="Profile"
            className="w-20 h-20 rounded-full mx-auto mb-4"
          />
          <h3 className="text-lg font-bold">
            {user?.firstName} {user?.lastName}
          </h3>
          <p className="text-sm text-gray-500">{user?.role}</p>
          <button className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
            Edit Profile
          </button>
        </div>
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700">Availability</h4>
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
  );
};

export default FreelancerDashboard;
