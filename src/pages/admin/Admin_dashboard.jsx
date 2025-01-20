import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);

  useEffect(() => {
    // Fetch number of users
    const fetchUserCount = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/users/count",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserCount(data.count);
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    };

    // Fetch number of jobs
    const fetchJobCount = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/jobs/count",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setJobCount(data.count);
      } catch (error) {
        console.error("Error fetching job count:", error);
      }
    };

    fetchUserCount();
    fetchJobCount();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Total Members
            </h2>
            <p className="text-3xl font-bold text-blue-500">{userCount}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Total Posts
            </h2>
            <p className="text-3xl font-bold text-green-500">{jobCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
