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
    return <p>You have not applied to any jobs yet</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Applications</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {applications.map((app) => {
          console.log("Resume Path:", app.resume); // ✅ Log resume path here

          return (
            <div key={app._id} className="bg-white rounded shadow p-4">
              <h2 className="font-semibold text-lg">
                Job Title: {app.jobId?.title || "N/A"}
              </h2>
              {app.jobId && (
                <p className="text-gray-600">
                  Company: {app.jobId.company} | Location: {app.jobId.location}{" "}
                  | {app.jobId.jobType}
                </p>
              )}

              <p className="mt-2 text-gray-700">
                <strong>Cover Letter:</strong> {app.coverLetter}
              </p>

              {app.resume ? (
                <p className="mt-2">
                  <a
                    href={`http://localhost:5000/${app.resume.replace(
                      /\\/g,
                      "/"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View Resume
                  </a>
                </p>
              ) : (
                <p className="mt-2 text-red-500">No resume uploaded</p>
              )}

              <p className="mt-2">
                <strong>Status:</strong> {app.status}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                Applied on {new Date(app.createdAt).toLocaleDateString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyApplications;
