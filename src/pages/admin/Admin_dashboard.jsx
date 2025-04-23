import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [userData, setUserData] = useState([]);
  const [jobData, setJobData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user count and time-based data
        // Replace these lines in the useEffect fetchData function:
        const userResponse = await axios.get(
          "http://localhost:5000/api/users/analytics",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserCount(userResponse.data.totalCount);
        setUserData(userResponse.data.dailyStats);

        const jobResponse = await axios.get(
          "http://localhost:5000/api/jobs/analytics",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setJobCount(jobResponse.data.totalCount);
        setJobData(jobResponse.data.dailyStats);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setErrorMessage("Failed to fetch dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // User chart data
  const userChartData = {
    labels: userData.map((data) => data.date),
    datasets: [
      {
        label: "Users",
        data: userData.map((data) => data.count),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  // Job chart data
  const jobChartData = {
    labels: jobData.map((data) => data.date),
    datasets: [
      {
        label: "Job Posts",
        data: jobData.map((data) => data.count),
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {errorMessage}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-lg font-medium text-gray-600 mb-2">
              Total Members
            </h2>
            <p className="text-5xl font-bold text-gray-800">{userCount}</p>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-lg font-medium text-gray-600 mb-2">
              Total Posts
            </h2>
            <p className="text-5xl font-bold text-gray-800">{jobCount}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <Line
              data={userChartData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: { display: true, text: "User Growth Over Time" },
                },
              }}
            />
          </div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <Line
              data={jobChartData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: { display: true, text: "Job Posts Over Time" },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
