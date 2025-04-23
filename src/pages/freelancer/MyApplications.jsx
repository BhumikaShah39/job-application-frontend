import React, { useEffect, useState } from "react";
import axios from "axios";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/applications/freelancer",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setApplications(response.data);
      } catch (error) {
        console.log("Error fetching applications", error);
      }
    };

    fetchApplications();
  }, []);

  if (applications.length === 0) {
    return (
      <p className="text-gray-500 text-center p-4">
        You have not applied to any jobs yet
      </p>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">My Applications</h1>

      <div className="space-y-4">
        {applications.map((app) => (
          <div
            key={app._id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800">
                  Job Title: {app.jobId?.title || "N/A"}
                </h2>
                {app.jobId && (
                  <p className="text-sm text-gray-600 mt-1">
                    Company: {app.jobId.company} | Location:{" "}
                    {app.jobId.location} | {app.jobId.jobType}
                  </p>
                )}
                <p className="mt-3 text-gray-700 text-sm">
                  <span className="font-medium">Cover Letter:</span>{" "}
                  {app.coverLetter}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Applied on {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-start md:items-end space-y-2">
                {app.resume ? (
                  <a
                    href={`http://localhost:5000/${app.resume.replace(
                      /\\/g,
                      "/"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-3 py-1 bg-[#58A6FF] text-white text-sm rounded-md hover:bg-[#1A2E46] transition"
                  >
                    View Resume
                  </a>
                ) : (
                  <p className="text-red-500 text-sm">No resume uploaded</p>
                )}
                <p className="text-sm">
                  <span className="font-medium">Status: </span>
                  <span
                    className={`${
                      app.status === "Hired"
                        ? "text-green-600"
                        : app.status === "Accepted"
                        ? "text-blue-600"
                        : "text-gray-600"
                    } font-medium`}
                  >
                    {app.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyApplications;
