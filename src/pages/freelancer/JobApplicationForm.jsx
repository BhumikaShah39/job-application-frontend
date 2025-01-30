import React, { useState } from "react";
import { UserData } from "../../context/UserContext";
import axios from "axios";

const JobApplicationForm = ({ jobId, onClose }) => {
  const { user } = UserData();
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("JobApplicationForm rendered for job ID:", jobId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("coverLetter", coverLetter);
    formData.append("resume", resume);
    formData.append("jobId", jobId);

    try {
      const token = localStorage.getItem("token");
      setIsSubmitting(true);

      await axios.post(
        "http://localhost:5000/api/applications/apply",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Application submitted successfully!");
      setIsSubmitting(false);
      onClose(); // Close the form on success
    } catch (error) {
      console.error("Error submitting application:", error);
      setIsSubmitting(false);
      alert("Failed to submit application.");
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Apply for the Job</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-medium mb-2">Name</label>
          <input
            type="text"
            value={`${user?.firstName} ${user?.lastName}`}
            className="w-full border rounded-lg p-2"
            readOnly
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">Email</label>
          <input
            type="email"
            value={user?.email}
            className="w-full border rounded-lg p-2"
            readOnly
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">LinkedIn Profile</label>
          <input
            type="url"
            value={user?.linkedin || ""}
            className="w-full border rounded-lg p-2"
            readOnly
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">Skills</label>
          <textarea
            value={user?.skills?.join(", ") || ""}
            className="w-full border rounded-lg p-2"
            readOnly
          ></textarea>
        </div>

        {/* Cover Letter Field */}
        <div className="mb-4">
          <label className="block font-medium mb-2">
            Cover Letter (Answer why do you want this job in 100 words )
          </label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)} // Handle text input
            className="w-full border rounded-lg p-2"
            placeholder="Write your cover letter here..."
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">Resume</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResume(e.target.files[0])}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 rounded-lg font-medium 
             bg-[#58A6FF] text-white 
             hover:bg-[#1A2E46] hover:text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
};

export default JobApplicationForm;
