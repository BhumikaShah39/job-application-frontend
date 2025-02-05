import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserData } from "../../context/UserContext";
import { FaFileAlt } from "react-icons/fa"; // optional icon from react-icons

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const { user } = UserData();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/applications/hirer",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setApplications(response.data);
      } catch (error) {
        console.log("Error fetching applications:", error);
      }
    };

    fetchApplications();
  }, []);

  if (applications.length === 0) {
    return <p className="text-xl">No applications found for your jobs.</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Applications</h1>

      <div className="flex flex-col space-y-4">
        {applications.map((app) => (
          <div
            key={app._id}
            className="bg-white shadow rounded-lg p-4 flex flex-col md:flex-row"
          >
            {/* Left column: applicant info & cover letter */}
            <div className="flex-1 mr-4 mb-4 md:mb-0">
              {/* Applicant Name */}
              <h2 className="font-semibold text-lg mb-1">
                {app.userId
                  ? `${app.userId.firstName} ${app.userId.lastName}`
                  : "N/A"}
              </h2>

              {/* Email */}
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Email:</span>{" "}
                {app.userId?.email || "N/A"}
              </p>

              {/* Skills */}
              {app.userId?.skills && (
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">Skills:</span>{" "}
                  {app.userId.skills.join(", ")}
                </p>
              )}

              {/* Education */}
              {app.userId?.education && (
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">Education:</span>{" "}
                  {app.userId.education}
                </p>
              )}

              {/* LinkedIn */}
              {app.userId?.linkedin && (
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">LinkedIn:</span>{" "}
                  <a
                    href={app.userId.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {app.userId.linkedin}
                  </a>
                </p>
              )}

              {/* GitHub */}
              {app.userId?.github && (
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">GitHub:</span>{" "}
                  <a
                    href={app.userId.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {app.userId.github}
                  </a>
                </p>
              )}

              {/* Job Title */}
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Applied for:</span>{" "}
                {app.jobId?.title || "N/A"}
              </p>

              {/* Cover Letter */}
              {app.coverLetter && (
                <div className="mt-2">
                  <span className="font-semibold">Cover Letter:</span>
                  <p className="ml-2 text-gray-700 whitespace-pre-wrap">
                    {app.coverLetter}
                  </p>
                </div>
              )}
            </div>

            {/* Right column: resume download */}
            <div className="flex items-center md:items-start">
              {app.resume ? (
                <a
                  href={`/${app.resume}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:underline"
                >
                  <FaFileAlt className="mr-1 text-xl" />
                  Download Resume
                </a>
              ) : (
                <p className="text-red-500">No Resume</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Applications;
