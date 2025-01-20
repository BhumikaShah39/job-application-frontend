import React, { useEffect, useState } from "react";
import axios from "axios";

const ManagePosts = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/jobs/all", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setJobs(data.jobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-800">{job.title}</h2>
            <p className="text-sm text-gray-600">
              <strong>Company:</strong> {job.company}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Location:</strong> {job.location}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Workplace Type:</strong> {job.workplaceType}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Job Type:</strong> {job.jobType}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Category:</strong> {job.category}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Subcategory:</strong> {job.subCategory}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Posted By:</strong> {job.hirer?.firstName}{" "}
              {job.hirer?.lastName}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagePosts;
