// EditProfile.jsx (updated)
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UserData } from "../../context/UserContext";

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

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, refreshUser, loading } = UserData();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [education, setEducation] = useState([""]);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [khaltiId, setKhaltiId] = useState("");
  const [experience, setExperience] = useState([""]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Refresh user data on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("Refreshing user data on EditProfile mount");
      refreshUser(token);
    }
  }, [refreshUser]);

  // Update form fields when user data changes
  useEffect(() => {
    if (user && user.role === "user") {
      console.log("User data in EditProfile useEffect:", user);
      console.log("Setting khaltiId to:", user.khaltiId || "");
      setSelectedInterests(user.interests || []);
      setEducation(user.education?.length > 0 ? user.education : [""]);
      setSkills(user.skills || []);
      setLinkedin(user.linkedin || "");
      setGithub(user.github || "");
      setKhaltiId(user.khaltiId || "");
      setExperience(user.experience?.length > 0 ? user.experience : [""]);
    }
  }, [user]);

  // Redirect hirers to ManageBusinessProfile
  useEffect(() => {
    if (user && user.role === "hirer") {
      navigate(`/hirer/${user._id}/manage-business-profile`);
    }
  }, [user, navigate]);

  const handleAddField = (setState, state) => setState([...state, ""]);
  const handleRemoveField = (setState, state, index) =>
    setState(state.filter((_, i) => i !== index));

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleSubcategoryClick = (subcategory) => {
    if (!selectedInterests.includes(subcategory)) {
      setSelectedInterests([...selectedInterests, subcategory]);
    } else {
      setSelectedInterests(
        selectedInterests.filter((interest) => interest !== subcategory)
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.target.name === "newSkill" && newSkill.trim() !== "") {
        setSkills([...skills, newSkill.trim()]);
        setNewSkill("");
      }
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);

    const data = new FormData();
    data.append("interests", JSON.stringify(selectedInterests));
    data.append("education", JSON.stringify(education));
    data.append("skills", JSON.stringify(skills));
    data.append("linkedin", linkedin);
    data.append("github", github);
    data.append("khaltiId", khaltiId);
    data.append("experience", JSON.stringify(experience));

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/users/complete-profile",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      // Refresh user data after profile update
      await refreshUser(token);
      setTimeout(() => {
        navigate(`/user/${user._id}`);
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
      setLoadingProfile(false);
    }
  };

  if (loading || !user)
    return <p className="text-center text-gray-500">Loading...</p>;

  if (user.role !== "user") return null;

  return (
    <div className="min-h-screen bg-[#FDFEFE] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-[#2E4053] text-center mb-8">
          Edit Profile
        </h1>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[#2E4053] mb-4">
            Profile Details
          </h2>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-medium text-[#1A2E46] mb-4">
                Interests
              </h3>
              {!selectedCategory ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                  <h4 className="text-lg font-semibold text-[#1A2E46] mb-2">
                    Subcategories for{" "}
                    <span className="text-[#58A6FF]">{selectedCategory}</span>
                  </h4>
                  <hr className="border-t-2 border-[#58A6FF] mb-4" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                  <h4 className="text-lg font-medium text-[#1A2E46] mb-2">
                    Selected Interests
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

            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-medium text-[#1A2E46] mb-4">
                Education
              </h3>
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
                    onKeyPress={handleKeyPress}
                    className="flex-grow border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
                    placeholder="Enter your education (e.g., B.Sc. Computer Science)"
                  />
                  {education.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveField(setEducation, education, index)
                      }
                      className="text-red-500 font-bold hover:text-red-700 transition-colors"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddField(setEducation, education)}
                className="mt-2 text-[#1A2E46] font-medium hover:text-[#58A6FF] transition-colors"
              >
                + Add More
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-medium text-[#1A2E46] mb-4">
                Skills
              </h3>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  name="newSkill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-grow border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
                  placeholder="Enter a skill (e.g., JavaScript)"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSkill.trim() !== "") {
                      setSkills([...skills, newSkill.trim()]);
                      setNewSkill("");
                    }
                  }}
                  className="px-4 py-2 bg-[#58A6FF] text-white rounded-lg hover:bg-[#1A2E46] transition-all"
                >
                  Add Skill
                </button>
              </div>
              {skills.length > 0 && (
                <ul className="space-y-2">
                  {skills.map((skill, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-[#2E4053]">{skill}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSkills(skills.filter((_, i) => i !== index))
                        }
                        className="text-red-500 font-medium hover:text-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-medium text-[#1A2E46] mb-4">
                Social Links
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2 text-[#1A2E46]">
                    LinkedIn Profile (Optional)
                  </label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
                    placeholder="Enter your LinkedIn profile URL"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2 text-[#1A2E46]">
                    GitHub Profile (Optional)
                  </label>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
                    placeholder="Enter your GitHub profile URL"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2 text-[#1A2E46]">
                    Khalti ID (Phone Number){" "}
                    {process.env.NODE_ENV === "development"
                      ? "(Use 9800000001 for testing)"
                      : "(Optional)"}
                  </label>
                  <input
                    type="text"
                    value={khaltiId}
                    onChange={(e) => setKhaltiId(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
                    placeholder="Enter your Khalti registered phone number (e.g., 9800000001)"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-medium text-[#1A2E46] mb-4">
                Experience
              </h3>
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
                    onKeyPress={handleKeyPress}
                    className="flex-grow border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
                    placeholder="Enter your experience (e.g., Software Engineer at XYZ)"
                  />
                  {experience.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveField(setExperience, experience, index)
                      }
                      className="text-red-500 font-bold hover:text-red-700 transition-colors"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddField(setExperience, experience)}
                className="mt-2 text-[#1A2E46] font-medium hover:text-[#58A6FF] transition-colors"
              >
                + Add More
              </button>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={loadingProfile}
                className="bg-[#1A2E46] hover:bg-[#58A6FF] text-white px-6 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              >
                {loadingProfile ? "Saving..." : "Save Profile Details"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="border border-[#E8EEF1] hover:bg-gray-100 text-[#2E4053] px-6 py-2 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
