import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FreelancerAnalytics = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterYear, setFilterYear] = useState(""); // Filter by year

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/projects/freelancer",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Fetched Projects:", response.data);
        setProjects(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load analytics data.");
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Process data for charts
  const completedProjects = projects.filter(
    (project) => project.status && project.status.toLowerCase() === "completed"
  );

  console.log("Completed Projects:", completedProjects);

  // Extract unique years for filter
  const years = [
    ...new Set(
      completedProjects.map((project) => {
        const date = project.completedAt
          ? new Date(project.completedAt)
          : project.createdAt
          ? new Date(project.createdAt)
          : new Date();
        return date.getFullYear();
      })
    ),
  ].sort();

  // Apply year filter
  let filteredProjects = completedProjects;
  if (filterYear) {
    filteredProjects = filteredProjects.filter((project) => {
      const date = project.completedAt
        ? new Date(project.completedAt)
        : project.createdAt
        ? new Date(project.createdAt)
        : new Date();
      return date.getFullYear() === parseInt(filterYear);
    });
  }

  // Summary Statistics
  const totalCompleted = completedProjects.length;
  const averageDuration = completedProjects.length
    ? Math.round(
        completedProjects.reduce((sum, project) => {
          const start = project.createdAt
            ? new Date(project.createdAt)
            : new Date();
          const end = project.completedAt
            ? new Date(project.completedAt)
            : new Date();
          const duration = (end - start) / (1000 * 60 * 60 * 24); // Duration in days
          return sum + duration;
        }, 0) / completedProjects.length
      )
    : 0;

  // Bar Chart: Projects completed per month
  const projectsPerMonth = {};
  const monthYearLabels = {};

  // Determine the range of months to display
  const selectedYear = filterYear
    ? parseInt(filterYear)
    : new Date().getFullYear();
  const startMonth = filterYear ? 1 : 1; // Start from January if a year is selected
  const endMonth = filterYear ? 12 : new Date().getMonth() + 1; // End at December if a year is selected, otherwise current month

  // Initialize all months in the selected year with zero projects
  for (let month = startMonth; month <= endMonth; month++) {
    const monthYearKey = `${selectedYear}-${String(month).padStart(2, "0")}`;
    const date = new Date(selectedYear, month - 1);
    const monthYearLabel = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    projectsPerMonth[monthYearKey] = 0; // Initialize with zero
    monthYearLabels[monthYearKey] = monthYearLabel;
  }

  // Populate actual project counts
  filteredProjects.forEach((project) => {
    const date = project.completedAt
      ? new Date(project.completedAt)
      : project.createdAt
      ? new Date(project.createdAt)
      : new Date();
    const monthYearKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`; // Format: YYYY-MM for internal use
    const monthYearLabel = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    }); // Format: "April 2025"
    projectsPerMonth[monthYearKey] = (projectsPerMonth[monthYearKey] || 0) + 1;
    monthYearLabels[monthYearKey] = monthYearLabel;
  });

  const sortedKeys = Object.keys(projectsPerMonth).sort();
  const barChartData = {
    labels: sortedKeys.map((key) => monthYearLabels[key]),
    datasets: [
      {
        label: "Projects Completed",
        data: sortedKeys.map((key) => projectsPerMonth[key]),
        backgroundColor: "rgba(88, 166, 255, 0.6)",
        borderColor: "rgba(88, 166, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Projects Completed Per Month",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Projects",
        },
      },
      x: {
        title: {
          display: true,
          text: "Month",
        },
      },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">Work Analytics</h1>

      {loading ? (
        <p className="text-gray-500 text-center">Loading analytics...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : completedProjects.length === 0 ? (
        <p className="text-gray-500 text-center">
          No completed projects found to display analytics.
        </p>
      ) : (
        <div className="space-y-8">
          {/* Summary Statistics */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Total Completed Projects
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {totalCompleted}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Average Project Duration (Days)
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {averageDuration}
                </p>
              </div>
            </div>
          </div>

          {/* Filter by Year */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Filter Analytics
            </h2>
            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Year
                </label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All Years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bar Chart: Projects Completed Per Month */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="max-w-3xl mx-auto">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>

          {/* Project List */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Completed Projects
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed On
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <tr key={project._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.completedAt
                          ? new Date(project.completedAt).toLocaleDateString()
                          : project.createdAt
                          ? new Date(project.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerAnalytics;
