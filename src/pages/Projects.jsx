import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserData } from "../context/UserContext";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const Projects = () => {
  const { user } = UserData();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const endpoint =
          user.role === "hirer" ? "/projects/hirer" : "/projects/freelancer";
        const response = await axios.get(
          `http://localhost:5000/api${endpoint}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProjects(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setLoading(false);
        toast.error("Failed to fetch projects.");
      }
    };

    fetchProjects();
  }, [user]);

  const ProjectCard = ({ project }) => {
    const jobTitle = project.applicationId?.jobId?.title || "N/A";

    const handleMarkAsCompleted = () => {
      navigate(`/projects/${project._id}/payment`, {
        state: { from: `/hirer/${user._id}/projects` },
      });
    };

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800">
              {project.title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Status: </span>
              <span
                className={`${
                  project.status === "Completed"
                    ? "text-blue-700"
                    : "text-yellow-600"
                } font-medium`}
              >
                {project.status}
              </span>
            </p>
            <p className="mt-1 text-sm text-gray-600">
              <span className="font-medium">Related Job: </span>
              {jobTitle}
            </p>
          </div>
          <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-start md:items-end space-y-2">
            <Link
              to={`/projects/${project._id}`}
              className="inline-block px-3 py-1 bg-[#58A6FF] text-white text-sm rounded-md hover:bg-[#1A2E46] transition"
            >
              View Project Details
            </Link>
            {user.role === "hirer" && (
              <button
                onClick={handleMarkAsCompleted}
                disabled={project.status === "Completed"}
                className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                  project.status === "Completed"
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {project.status === "Completed"
                  ? "Project Completed"
                  : "Mark as Completed"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">My Projects</h1>
      {loading ? (
        <p className="text-gray-500 text-center">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-500 text-center">No projects found.</p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
