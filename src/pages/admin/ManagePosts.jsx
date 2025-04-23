import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
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

const ManagePosts = () => {
  const [jobs, setJobs] = useState([]);
  const [jobData, setJobData] = useState([]); // For chart data
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [selectedJobs, setSelectedJobs] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all jobs
        const jobsResponse = await axios.get(
          "http://localhost:5000/api/jobs/all",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setJobs(jobsResponse.data.jobs);

        // Fetch job analytics for chart
        const analyticsResponse = await axios.get(
          "http://localhost:5000/api/jobs/analytics",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setJobData(analyticsResponse.data.dailyStats);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(
          "Failed to fetch jobs or analytics data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectJob = (jobId) => {
    setSelectedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allJobIds = filteredJobs.map((job) => job._id);
      setSelectedJobs(new Set(allJobIds));
    } else {
      setSelectedJobs(new Set());
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesCategory = filters.category
      ? job.category === filters.category
      : true;

    // Date filtering logic
    const jobDate = new Date(job.createdAt);
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    const endDate = filters.endDate ? new Date(filters.endDate) : null;

    let matchesDate = true;
    if (startDate && endDate) {
      matchesDate = jobDate >= startDate && jobDate <= endDate;
    } else if (startDate) {
      const startDateOnly = startDate.toISOString().split("T")[0];
      const jobDateOnly = jobDate.toISOString().split("T")[0];
      matchesDate = jobDateOnly === startDateOnly;
    } else if (endDate) {
      const endDateOnly = endDate.toISOString().split("T")[0];
      const jobDateOnly = jobDate.toISOString().split("T")[0];
      matchesDate = jobDateOnly === endDateOnly;
    }

    const matchesSearch = filters.search
      ? job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.search.toLowerCase())
      : true;

    return matchesCategory && matchesDate && matchesSearch;
  });

  const handleDelete = async (jobId) => {
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      setSelectedJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      toast.success("Job deleted successfully!");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to delete job. Please try again."
      );
    }
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Job Posts Over Time",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Chart data
  const jobChartData = {
    labels: jobData.map((data) => data.date),
    datasets: [
      {
        label: "Job Posts",
        data: jobData.map((data) => data.count),
        borderColor: "rgb(255, 99, 132)", // Pink color to match AdminDashboard
        tension: 0.1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading jobs...</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">No jobs found.</p>
      </div>
    );
  }

  // Get unique categories for the filter dropdown
  const categories = [...new Set(jobs.map((job) => job.category))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manage Posts</h1>
            <p className="text-sm text-gray-500">Total Jobs: {jobs.length}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <Line data={jobChartData} options={chartOptions} />
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search jobs by title or company"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="min-w-[150px]">
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[150px]">
              <label className="block text-sm text-gray-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="min-w-[150px]">
              <label className="block text-sm text-gray-600 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      selectedJobs.size === filteredJobs.length &&
                      filteredJobs.length > 0
                    }
                  />
                </th>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Hirer</th>
                <th className="p-4 text-left">Posted Date</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedJobs.has(job._id)}
                      onChange={() => handleSelectJob(job._id)}
                    />
                  </td>
                  <td className="p-4 text-gray-800">{job.title}</td>
                  <td className="p-4 text-gray-600">{job.category}</td>
                  <td className="p-4 text-gray-600">
                    {job.hirer?.firstName} {job.hirer?.lastName}
                  </td>
                  <td className="p-4 text-gray-600">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagePosts;
