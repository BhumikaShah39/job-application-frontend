import React, { useState } from "react";
import axios from "axios";

// Data for categories and subcategories
const interestsData = {
  Technology: [
    "Software Development",
    "Data Science",
    "Cybersecurity",
    "IT Support",
  ],
  Design: ["Graphic Design", "UI/UX Design", "Product Design", "Animation"],
  Marketing: [
    "Digital Marketing",
    "SEO / SEM",
    "Content Marketing",
    "Social Media Management",
  ],
  Writing: ["Content Writing", "Technical Writing", "Translation Services"],
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
        alert("Profile completed successfully!");
        window.location.href = `/user/${response.data.user._id}`; // Redirect to the user's dashboard
      }
    } catch (error) {
      console.error("Error completing profile:", error);
      alert("Failed to complete profile. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white shadow-lg rounded-lg max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6">Complete Your Profile</h2>

      {/* Profile Picture */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Profile Picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfilePicture(e.target.files[0])}
          className="w-full border rounded-lg p-2"
        />
      </div>

      {/* Interests */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Select Your Interests</label>
        {!selectedCategory &&
          Object.keys(interestsData).map((category) => (
            <button
              key={category}
              type="button"
              className="px-4 py-2 m-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}

        {selectedCategory && (
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Select Subcategories for {selectedCategory}
            </h3>
            {interestsData[selectedCategory].map((subcategory) => (
              <button
                key={subcategory}
                type="button"
                className={`px-4 py-2 m-2 rounded ${
                  selectedInterests.includes(subcategory)
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-black hover:bg-gray-400"
                }`}
                onClick={() => handleSubcategoryClick(subcategory)}
              >
                {subcategory}
              </button>
            ))}
            <button
              type="button"
              className="block mt-4 text-blue-500 underline"
              onClick={() => setSelectedCategory(null)}
            >
              Back to Categories
            </button>
          </div>
        )}

        {selectedInterests.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold">Selected Interests:</h4>
            <ul className="list-disc list-inside">
              {selectedInterests.map((interest, index) => (
                <li key={index}>{interest}</li>
              ))}
            </ul>
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
          className="text-blue-500 font-bold"
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
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
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
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
          className="text-blue-500 font-bold"
        >
          + Add More
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Save Profile
      </button>
    </form>
  );
};

export default CompleteProfileForm;
