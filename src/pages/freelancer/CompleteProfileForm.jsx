import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

// Data for categories and subcategories
const interestsData = {
  Technology: [
    "Software Development",
    "Data Science",
    "Cybersecurity",
    "IT Support",
    "Cloud Computing",
    "Mobile App Development",
    "DevOps Engineering",
    "Network Administration",
  ],
  Design: [
    "Graphic Design",
    "UI/UX Design",
    "Product Design",
    "Animation",
    "3D Modeling",
    "Web Design",
    "Illustration",
    "Motion Graphics",
  ],
  Marketing: [
    "Digital Marketing",
    "SEO / SEM",
    "Content Marketing",
    "Social Media Management",
    "Affiliate Marketing",
    "Email Marketing",
    "Brand Management",
  ],
  Writing: [
    "Content Writing",
    "Technical Writing",
    "Translation Services",
    "Copywriting",
    "Proofreading & Editing",
    "Blog Writing",
  ],
  Business: [
    "Business Consulting",
    "Project Management",
    "Human Resources",
    "Accounting & Bookkeeping",
    "Financial Analysis",
    "Sales Strategy",
  ],
  Education: [
    "Online Tutoring",
    "Curriculum Development",
    "E-Learning Development",
    "Academic Research",
    "Corporate Training",
  ],
  Media: [
    "Video Production",
    "Photography",
    "Podcast Production",
    "Voice-over Services",
    "Video Editing",
    "Content Creation",
  ],
};

const CompleteProfileForm = () => {
  const [selectedCategory, setSelectedCategory] = useState(null); // Tracks the selected category
  const [selectedInterests, setSelectedInterests] = useState([]); // Tracks selected subcategories
  const [education, setEducation] = useState([""]);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState(""); // Added to handle new skill input
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [experience, setExperience] = useState([""]);
  const [profilePicture, setProfilePicture] = useState(null);

  // Add or remove input fields dynamically
  const handleAddField = (setState, state) => setState([...state, ""]);
  const handleRemoveField = (setState, state, index) =>
    setState(state.filter((_, i) => i !== index));

  // Handle category selection
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  // Handle subcategory selection
  const handleSubcategoryClick = (subcategory) => {
    if (!selectedInterests.includes(subcategory)) {
      setSelectedInterests([...selectedInterests, subcategory]);
    } else {
      setSelectedInterests(
        selectedInterests.filter((interest) => interest !== subcategory)
      );
    }
  };

  // Prevent Enter key from submitting the form in any input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Stop form submission
      if (e.target.name === "newSkill" && newSkill.trim() !== "") {
        setSkills([...skills, newSkill.trim()]);
        setNewSkill("");
      }
    }
  };

  // Submit profile completion data
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(); // Create FormData object for handling file upload
    formData.append("profilePicture", profilePicture);
    formData.append("interests", JSON.stringify(selectedInterests)); // Convert interests to JSON string
    formData.append("education", JSON.stringify(education)); // Convert education to JSON string
    formData.append("skills", JSON.stringify(skills)); // Convert skills to JSON string
    formData.append("linkedin", linkedin);
    formData.append("github", github);
    formData.append("experience", JSON.stringify(experience)); // Convert experience to JSON string

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("You are not logged in. Please log in again.");
      window.location.href = "/login";
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:5000/api/users/complete-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // Required for file uploads
          },
        }
      );

      if (response.status === 200) {
        toast.success("Profile completed successfully!");
        window.location.href = `/user/${response.data.user._id}`; // Redirect to the user's dashboard
      }
    } catch (error) {
      console.error("Error completing profile:", error.response?.data || error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to complete profile. Please try again.";
      toast.error(errorMessage);
      // Only log out if explicitly a token issue (e.g., "Token expired" or similar)
      if (
        error.response?.status === 401 &&
        error.response?.data?.message?.toLowerCase().includes("token")
      ) {
        localStorage.removeItem("token");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 bg-white shadow-md rounded-xl max-w-3xl mx-auto border border-gray-200"
    >
      <h2 className="text-3xl font-bold mb-6 text-[#1A2E46] text-center">
        Complete Your Profile
      </h2>

      {/* Profile Picture */}
      <div className="space-y-4">
        <label className="block font-medium mb-2 text-[#1A2E46]">
          Profile Picture
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfilePicture(e.target.files[0])}
          className="w-full border rounded-md p-2"
        />
      </div>

      <div className="mb-6">
        <label className="block text-xl font-semibold text-[#1A2E46] mb-4">
          Select Your Interests
        </label>

        {!selectedCategory ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.keys(interestsData).map((category) => (
              <button
                key={category}
                type="button"
                className="px-4 py-2 bg-[#58A6FF80] text-[#1A2E46] rounded-md hover:bg-[#1A2E46] hover:text-white transition-transform transform hover:scale-105"
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold text-[#1A2E46] mb-2">
              Subcategories for{" "}
              <span className="text-[#58A6FF]">{selectedCategory}</span>
            </h3>
            <hr className="border-t-2 border-[#58A6FF] mb-4" />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interestsData[selectedCategory].map((subcategory) => (
                <button
                  key={subcategory}
                  type="button"
                  className={`px-3 py-2 rounded-md shadow-sm transition-transform transform hover:scale-105 ${
                    selectedInterests.includes(subcategory)
                      ? "bg-[#58A6FF] text-white"
                      : "bg-[#58A6FF40] text-[#1A2E46] hover:bg-[#1A2E46] hover:text-white"
                  }`}
                  onClick={() => handleSubcategoryClick(subcategory)}
                >
                  {subcategory}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="mt-4 flex items-center text-[#58A6FF] hover:text-[#1A2E46]"
              onClick={() => setSelectedCategory(null)}
            >
              <span className="mr-2">←</span> Back to Categories
            </button>
          </div>
        )}

        {selectedInterests.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-[#1A2E46] mb-2">
              Selected Interests:
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedInterests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#58A6FF20] text-[#1A2E46] rounded-full shadow-sm border border-[#58A6FF]"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Education */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Education</label>
        {education.map((edu, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={edu}
              onChange={(e) => {
                const newEdu = [...education];
                newEdu[index] = e.target.value;
                setEducation(newEdu);
              }}
              onKeyPress={handleKeyPress} // Prevent Enter submission
              className="flex-grow border rounded-lg p-2"
              placeholder="Enter your education"
            />
            {education.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  handleRemoveField(setEducation, education, index)
                }
                className="text-red-500 font-bold"
              >
                X
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddField(setEducation, education)}
          className="text-[#1A2E46] font-bold hover:text-[#58A6FF]"
        >
          + Add More
        </button>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Skills</label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            name="newSkill" // Add name for identification in handleKeyPress
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress} // Add skill on Enter
            className="flex-grow border rounded-lg p-2"
            placeholder="Enter a skill"
          />
          <button
            type="button"
            onClick={() => {
              if (newSkill.trim() !== "") {
                setSkills([...skills, newSkill.trim()]);
                setNewSkill("");
              }
            }}
            className="px-4 py-2 bg-[#58A6FF] text-white rounded hover:bg-[#1A2E46]"
          >
            Add Skill
          </button>
        </div>
        <ul className="mt-2">
          {skills.map((skill, index) => (
            <li key={index} className="flex items-center space-x-2">
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => setSkills(skills.filter((_, i) => i !== index))}
                className="text-red-500 font-bold"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* LinkedIn */}
      <div className="mb-4">
        <label className="block font-medium mb-2">LinkedIn Profile</label>
        <input
          type="url"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          onKeyPress={handleKeyPress} // Prevent Enter submission
          className="w-full border rounded-lg p-2"
          placeholder="Enter your LinkedIn profile URL"
        />
      </div>

      {/* GitHub */}
      <div className="mb-4">
        <label className="block font-medium mb-2">GitHub Profile</label>
        <input
          type="url"
          value={github}
          onChange={(e) => setGithub(e.target.value)}
          onKeyPress={handleKeyPress} // Prevent Enter submission
          className="w-full border rounded-lg p-2"
          placeholder="Enter your GitHub profile URL"
        />
      </div>

      {/* Experience */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Experience</label>
        {experience.map((exp, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={exp}
              onChange={(e) => {
                const newExp = [...experience];
                newExp[index] = e.target.value;
                setExperience(newExp);
              }}
              onKeyPress={handleKeyPress} // Prevent Enter submission
              className="flex-grow border rounded-lg p-2"
              placeholder="Enter your experience"
            />
            {experience.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  handleRemoveField(setExperience, experience, index)
                }
                className="text-red-500 font-bold"
              >
                X
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddField(setExperience, experience)}
          className="text-[#1A2E46] font-bold hover:text-[#58A6FF]"
        >
          + Add More
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-[#58A6FF] text-white py-2 rounded-lg hover:bg-[#1A2E46]"
      >
        Save Profile
      </button>
    </form>
  );
};

export default CompleteProfileForm;
