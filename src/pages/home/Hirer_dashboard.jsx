import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import axios from "axios";

const HirerDashboard = () => {
  const { user, isAuth } = UserData();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch jobs added by the hirer
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:5000/api/jobs/added-by-you",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setJobs(data.jobs);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setLoading(false);
      }
    };

    if (isAuth && user) fetchJobs();
  }, [user, isAuth]);

  if (loading) {
    return <p>Loading...</p>;
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
                {/* Job Details */}
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
                {/* Action Button */}
                <div className="mt-4 md:mt-0 md:ml-6">
                  <button
                    onClick={() =>
                      navigate(`/hirer/${user._id}/jobs/${job._id}`)
                    }
                    className="px-4 py-2 bg-[#58A6FF] text-white rounded-md hover:bg-[#1A2E46] whitespace-nowrap"
                  >
                    View Details
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
    </div>
  );
};

export default HirerDashboard;
