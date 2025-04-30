import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import DefaultProfileImage from "../assets/DefaultProfileImage.avif";

const ProfileView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }
        const response = await axios.get(
          `http://localhost:5000/api/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProfile(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load profile");
        setLoading(false);
        if (
          error.message === "No token found" ||
          error.response?.status === 401
        ) {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        }
      }
    };

    fetchProfile();
  }, [userId, navigate]);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageLightbox = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!profile || !profile.user) {
    return <p className="text-center text-red-500">Profile not found.</p>;
  }

  // Extract user data
  const user = profile.user;

  // Placeholder for rating (since ratings are not fully implemented in your backend)
  const rating =
    user.ratings?.length > 0
      ? (
          user.ratings.reduce((sum, r) => sum + r.rating, 0) /
          user.ratings.length
        ).toFixed(1)
      : "N/A";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Back Button with Arrow */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition mb-4 sm:mb-0"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back</span>
            </button>

            {/* Profile Picture */}
            <img
              src={
                user.profilePicture
                  ? `http://localhost:5000/${user.profilePicture.replace(
                      /\\/g,
                      "/"
                    )}`
                  : DefaultProfileImage
              }
              alt="Profile"
              className="w-32 h-32 rounded-lg shadow-md"
              onError={(e) => {
                console.error(
                  "Error loading profile picture:",
                  user.profilePicture
                );
                e.target.src = DefaultProfileImage;
              }}
            />

            {/* User Info and Actions */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600 capitalize">{user.role}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-lg font-semibold text-gray-900">
                  {rating}
                </span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(parseFloat(rating) || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.465a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.39-2.465a1 1 0 00-1.175 0l-3.39 2.465c-.784.57-1.838-.197-1.54-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.297 9.397c-.784-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.97z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column (Profile Info) */}
          <div className="md:col-span-1 space-y-6">
            {/* Work Section */}
            {(user.role === "user" || user.role === "hirer") && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Work
                </h3>
                {user.role === "user" && user.experience?.length > 0 ? (
                  user.experience.map((exp, index) => (
                    <div key={index} className="mb-2">
                      <p className="text-gray-700">{exp}</p>
                      <p className="text-gray-500 text-sm">Experience</p>
                    </div>
                  ))
                ) : user.role === "hirer" && user.pastWork?.length > 0 ? (
                  user.pastWork.map((work, index) => (
                    <div key={index} className="mb-2">
                      <p className="text-gray-700">{work.title}</p>
                      <p className="text-gray-500 text-sm">{work.duration}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    No work experience added
                  </p>
                )}
              </div>
            )}

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Contact Information
              </h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-semibold">E-mail:</span> {user.email}
                </p>
                {user.linkedin && (
                  <p className="text-gray-700">
                    <span className="font-semibold">LinkedIn:</span>{" "}
                    <a
                      href={user.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {user.linkedin}
                    </a>
                  </p>
                )}
                {user.github && (
                  <p className="text-gray-700">
                    <span className="font-semibold">GitHub:</span>{" "}
                    <a
                      href={user.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {user.github}
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Basic Information
              </h3>
              <p className="text-gray-700">
                <span className="font-semibold">Role:</span>{" "}
                <span className="capitalize">{user.role}</span>
              </p>
            </div>

            {/* Skills Section */}
            {user.skills?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Skills
                </h3>
                <div className="space-y-1">
                  {user.skills.map((skill, index) => (
                    <p key={index} className="text-gray-700">
                      {skill}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Detailed Info) */}
          <div className="md:col-span-2 space-y-6">
            {/* Education Section */}
            {user.education?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Education
                </h3>
                <ul className="space-y-2">
                  {user.education.map((edu, index) => (
                    <li key={index} className="text-gray-700">
                      {edu}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Business Details (for Hirers) */}
            {user.role === "hirer" && user.businessDetails && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Business Details
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-semibold">Company:</span>{" "}
                    {user.businessDetails.companyName}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Industry:</span>{" "}
                    {user.businessDetails.industry}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Description:</span>{" "}
                    {user.businessDetails.description}
                  </p>
                  {user.businessDetails.website && (
                    <p className="text-gray-700">
                      <span className="font-semibold">Website:</span>{" "}
                      <a
                        href={user.businessDetails.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {user.businessDetails.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Certifications (for Freelancers) */}
            {user.role === "user" && profile.enhancements?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Certifications
                </h3>
                <ul className="space-y-4">
                  {profile.enhancements
                    .filter((e) => e.type === "certification")
                    .map((cert, index) => (
                      <li key={index} className="border-b pb-4 last:border-b-0">
                        <p className="text-gray-700 font-semibold">
                          {cert.details.name} - {cert.details.issuer}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Issued:{" "}
                          {new Date(
                            cert.details.issueDate
                          ).toLocaleDateString()}
                        </p>
                        {cert.details.images &&
                          cert.details.images.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {cert.details.images.map((img, imgIndex) => (
                                <img
                                  key={imgIndex}
                                  src={`http://localhost:5000/${img.replace(
                                    /\\/g,
                                    "/"
                                  )}`}
                                  alt="Certificate"
                                  className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition"
                                  onClick={() =>
                                    handleImageClick(
                                      `http://localhost:5000/${img.replace(
                                        /\\/g,
                                        "/"
                                      )}`
                                    )
                                  }
                                  onError={(e) => {
                                    console.error(
                                      "Error loading certificate image:",
                                      img
                                    );
                                    e.target.style.display = "none";
                                  }}
                                />
                              ))}
                            </div>
                          )}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Achievements (for Freelancers) */}
            {user.role === "user" && profile.enhancements?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Achievements
                </h3>
                <ul className="space-y-4">
                  {profile.enhancements
                    .filter((e) => e.type === "achievement")
                    .map((ach, index) => (
                      <li key={index} className="border-b pb-4 last:border-b-0">
                        <p className="text-gray-700 font-semibold">
                          {ach.details.name}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {ach.details.description}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Date:{" "}
                          {new Date(ach.details.issueDate).toLocaleDateString()}
                        </p>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Portfolio (for Freelancers) */}
            {user.role === "user" && profile.enhancements?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Portfolio
                </h3>
                <ul className="space-y-4">
                  {profile.enhancements
                    .filter((e) => e.type === "portfolio")
                    .map((port, index) => (
                      <li key={index} className="border-b pb-4 last:border-b-0">
                        <p className="text-gray-700 font-semibold">
                          {port.details.name}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {port.details.description}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Technologies: {port.details.technologies.join(", ")}
                        </p>
                        {port.details.link && (
                          <p>
                            <a
                              href={port.details.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline text-sm"
                            >
                              View Project
                            </a>
                          </p>
                        )}
                        {port.details.images &&
                          port.details.images.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {port.details.images.map((img, imgIndex) => (
                                <img
                                  key={imgIndex}
                                  src={`http://localhost:5000/${img.replace(
                                    /\\/g,
                                    "/"
                                  )}`}
                                  alt="Portfolio"
                                  className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition"
                                  onClick={() =>
                                    handleImageClick(
                                      `http://localhost:5000/${img.replace(
                                        /\\/g,
                                        "/"
                                      )}`
                                    )
                                  }
                                  onError={(e) => {
                                    console.error(
                                      "Error loading portfolio image:",
                                      img
                                    );
                                    e.target.style.display = "none";
                                  }}
                                />
                              ))}
                            </div>
                          )}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeImageLightbox}
        >
          <div className="relative">
            <img
              src={selectedImage}
              alt="Enlarged"
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
            <button
              className="absolute top-2 right-2 text-white text-3xl"
              onClick={closeImageLightbox}
              aria-label="Close image"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
