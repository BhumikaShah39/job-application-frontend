import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const FreelancerDashboard = () => {
  const { id } = useParams(); // Extract user ID from route
  const [userData, setUserData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `http://localhost:5000/api/users/user/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [id]);

  if (!userData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-white shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          Profile Completion
        </h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
            <span>Personal Information</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
            <span>Education</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
            <span>Skills</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-gray-300 rounded-full mr-2"></span>
            <span>Portfolio</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-gray-300 rounded-full mr-2"></span>
            <span>Certifications</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">
          Welcome, {userData.firstName} {userData.lastName}!
        </h1>
        <h2 className="text-lg font-semibold text-gray-600">Search for Jobs</h2>

        {/* Search Filter */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search for jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Job List */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-gray-700">
                {job.title}
              </h3>
              <p className="text-sm text-gray-500">{job.description}</p>
              <button className="mt-4 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
