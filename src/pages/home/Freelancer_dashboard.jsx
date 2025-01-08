import React, { useEffect, useState } from "react";
import { UserData } from "../../context/UserContext";
import axios from "axios";

const FreelancerDashboard = () => {
  const { user, isAuth } = UserData(); // Access user data from context
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);

  // Fetch all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/jobs/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched Jobs:", data.jobs);
        setJobs(data.jobs);
        setFilteredJobs(data.jobs); // Set initially filtered jobs to all jobs
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    if (isAuth && user) fetchJobs();
  }, [user, isAuth]);

  // Filter jobs based on search term
  useEffect(() => {
    const filtered = jobs.filter((job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
  }, [searchTerm, jobs]);

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen p-6">
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
          className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Job List */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => (
          <div
            key={job._id}
            className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold text-gray-700">{job.title}</h3>
            <p className="text-sm text-gray-500">{job.description}</p>
            <p className="text-sm text-gray-500">
              Posted by: {job.hirer.firstName} {job.hirer.lastName}
            </p>
            <button className="mt-4 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreelancerDashboard;
