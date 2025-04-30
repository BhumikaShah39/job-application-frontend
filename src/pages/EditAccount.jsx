import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { UserData } from "../context/UserContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

// Data for categories and subcategories (copied from CompleteProfileForm)
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

const EditAccount = () => {
  const navigate = useNavigate();
  const { user } = UserData();

  // State for account details (profile picture, password)
  const [accountData, setAccountData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    profilePicture: null,
  });

  // State for profile details (interests, education, skills, etc.) - for freelancers only
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [education, setEducation] = useState([""]);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [experience, setExperience] = useState([""]);

  // State for enhancements (certifications, portfolio, achievements) - for freelancers only
  const [enhancementData, setEnhancementData] = useState({
    type: "certification",
    details: {
      name: "",
      issuer: "",
      issueDate: "",
      description: "",
      link: "",
      technologies: [],
      images: [],
    },
  });

  const [enhancementFiles, setEnhancementFiles] = useState([]);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingEnhancement, setLoadingEnhancement] = useState(false);

  // Initialize profile data from user context (for freelancers)
  useEffect(() => {
    if (user && user.role === "user") {
      setSelectedInterests(user.interests || []);
      setEducation(user.education?.length > 0 ? user.education : [""]);
      setSkills(user.skills || []);
      setLinkedin(user.linkedin || "");
      setGithub(user.github || "");
      setExperience(user.experience?.length > 0 ? user.experience : [""]);
    }
  }, [user]);

  // Handlers for account details
  const handleAccountInputChange = (e) => {
    const { name, value } = e.target;
    setAccountData({ ...accountData, [name]: value });
  };

  const handleAccountFileChange = (e) => {
    setAccountData({ ...accountData, profilePicture: e.target.files[0] });
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    if (accountData.newPassword !== accountData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setLoadingAccount(true);
    const data = new FormData();
    if (accountData.currentPassword)
      data.append("currentPassword", accountData.currentPassword);
    if (accountData.newPassword)
      data.append("newPassword", accountData.newPassword);
    if (accountData.profilePicture)
      data.append("profilePicture", accountData.profilePicture);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/users/update-account",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      setTimeout(() => {
        navigate(`/${user.role}/${user._id}`);
      }, 1000);
    } catch (error) {
      console.error("Error updating account:", error);
      toast.error(error.response?.data?.message || "Failed to update account");
      setLoadingAccount(false);
    }
  };

  // Handlers for profile details (freelancers only)
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
    data.append("experience", JSON.stringify(experience));

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/users/complete-profile",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      setTimeout(() => {
        navigate(`/${user.role}/${user._id}`);
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
      setLoadingProfile(false);
    }
  };

  // Handlers for enhancements (freelancers only)
  const handleEnhancementInputChange = (e) => {
    const { name, value } = e.target;
    setEnhancementData({
      ...enhancementData,
      details: { ...enhancementData.details, [name]: value },
    });
  };

  const handleEnhancementTypeChange = (e) => {
    setEnhancementData({
      ...enhancementData,
      type: e.target.value,
      details: {
        name: "",
        issuer: "",
        issueDate: "",
        description: "",
        link: "",
        technologies: [],
        images: [],
      },
    });
    setEnhancementFiles([]);
  };

  const handleEnhancementFileChange = (e) => {
    setEnhancementFiles(e.target.files);
  };

  const handleEnhancementSubmit = async (e) => {
    e.preventDefault();
    setLoadingEnhancement(true);

    const data = new FormData();
    data.append("type", enhancementData.type);
    data.append("details", JSON.stringify(enhancementData.details));
    for (let i = 0; i < enhancementFiles.length; i++) {
      data.append("images", enhancementFiles[i]);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/users/add-enhancement",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      setEnhancementData({
        type: "certification",
        details: {
          name: "",
          issuer: "",
          issueDate: "",
          description: "",
          link: "",
          technologies: [],
          images: [],
        },
      });
      setEnhancementFiles([]);
    } catch (error) {
      console.error("Error adding enhancement:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to add enhancement";
      toast.error(errorMessage);
    } finally {
      setLoadingEnhancement(false);
    }
  };

  if (!user) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#FDFEFE] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-[#2E4053] text-center mb-8">
          Edit Profile
        </h1>

        {/* Account Details Card (for both freelancers and hirers) */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-[#2E4053] mb-4">
            Account Details
          </h2>
          <form onSubmit={handleAccountSubmit} className="space-y-5">
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img
                  src={
                    user.profilePicture
                      ? `http://localhost:5000/${user.profilePicture}`
                      : "https://via.placeholder.com/150"
                  }
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-4 border-[#E8EEF1] shadow-sm"
                />
                <input
                  type="file"
                  onChange={handleAccountFileChange}
                  className="mt-4 text-sm text-[#2E4053] w-full text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#2E4053] font-medium mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={accountData.currentPassword}
                  onChange={handleAccountInputChange}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E4053]"
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[#2E4053] font-medium mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={accountData.newPassword}
                  onChange={handleAccountInputChange}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E4053]"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[#2E4053] font-medium mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={accountData.confirmPassword}
                  onChange={handleAccountInputChange}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#2E4053]"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={loadingAccount}
                className="bg-[#1A2E46] hover:bg-[#58A6FF] text-white px-6 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              >
                {loadingAccount ? "Saving..." : "Save Account Changes"}
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

        {/* Profile Details Section (freelancers only) */}
        {user.role === "user" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#2E4053] mb-4">
              Profile Details
            </h2>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Interests Card */}
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

              {/* Education Card */}
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

              {/* Skills Card */}
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

              {/* Social Links Card (LinkedIn & GitHub) */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-medium text-[#1A2E46] mb-4">
                  Social Links
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-2 text-[#1A2E46]">
                      LinkedIn Profile
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
                      GitHub Profile
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
                </div>
              </div>

              {/* Experience Card */}
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

              {/* Save Profile Details Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="bg-[#1A2E46] hover:bg-[#58A6FF] text-white px-6 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
                >
                  {loadingProfile ? "Saving..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Enhancements Card (freelancers only) */}
        {user.role === "user" && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#2E4053] mb-4">
              Add Certifications, Achievements, or Portfolio
            </h2>
            <form onSubmit={handleEnhancementSubmit} className="space-y-4">
              <div>
                <label className="block text-[#2E4053] font-medium mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={enhancementData.type}
                  onChange={handleEnhancementTypeChange}
                  className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                >
                  <option value="certification">Certification</option>
                  <option value="achievement">Achievement</option>
                  <option value="portfolio">Portfolio</option>
                </select>
              </div>

              {enhancementData.type === "certification" && (
                <>
                  <div>
                    <label className="block text-[#2E4053] font-medium mb-1">
                      Certification Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={enhancementData.details.name}
                      onChange={handleEnhancementInputChange}
                      className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#2E4053] font-medium mb-1">
                      Issuer
                    </label>
                    <input
                      type="text"
                      name="issuer"
                      value={enhancementData.details.issuer}
                      onChange={handleEnhancementInputChange}
                      className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#2E4053] font-medium mb-1">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      name="issueDate"
                      value={enhancementData.details.issueDate}
                      onChange={handleEnhancementInputChange}
                      className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#2E4053] font-medium mb-1">
                      Certificate Image (Optional)
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleEnhancementFileChange}
                      className="w-full text-sm text-[#2E4053]"
                    />
                  </div>
                </>
              )}

              {enhancementData.type === "achievement" && (
                <>
                  <div>
                    <label className="block text-[#2E4053] font-medium mb-1">
                      Achievement Title
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={enhancementData.details.name}
                      onChange={handleEnhancementInputChange}
                      className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#2E4053] font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={enhancementData.details.description}
                      onChange={handleEnhancementInputChange}
                      className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#2E4053] font-medium mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="issueDate"
                      value={enhancementData.details.issueDate}
                      onChange={handleEnhancementInputChange}
                      className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                      required
                    />
                  </div>
                </>
              )}

              {enhancementData.type === "portfolio" && (
                <>
                  <div>
                    <label className="block text-[#2E4053] font-medium mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={enhancementData.details.name}
                      onChange={handleEnhancementInputChange}
                      className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#2E4053] font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={enhancementData.details.description}
                      onChange={handleEnhancementInputChange}
                      className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#2E4053] font-medium mb-1">
                      Technologies (Comma-separated)
                    </label>
                    <input
                      type="text"
                      name="technologies"
                      value={enhancementData.details.technologies.join(", ")}
                      onChange={(e) =>
                        setEnhancementData({
                          ...enhancementData,
                          details: {
                            ...enhancementData.details,
                            technologies: e.target.value
                              .split(",")
                              .map((t) => t.trim()),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#2E4053] font-medium mb-1">
                      Project Link (Optional)
                    </label>
                    <input
                      type="url"
                      name="link"
                      value={enhancementData.details.link}
                      onChange={handleEnhancementInputChange}
                      className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#2E4053] font-medium mb-1">
                      Project Images (Optional)
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleEnhancementFileChange}
                      className="w-full text-sm text-[#2E4053]"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loadingEnhancement}
                  className="bg-[#58A6FF] hover:bg-[#1A2E46] text-white px-6 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
                >
                  {loadingEnhancement ? "Adding..." : "Add Enhancement"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Business Profile Card (hirers only) */}
        {user.role === "hirer" && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-[#2E4053] mb-4">
              Business Profile
            </h2>
            <p className="text-[#2E4053] mb-4">
              Manage your business details, including company information and
              past work.
            </p>
            <div className="flex justify-end">
              <Link
                to={`/hirer/${user._id}/manage-business-profile`}
                className="bg-[#58A6FF] hover:bg-[#1A2E46] text-white px-6 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              >
                Manage Business Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditAccount;
