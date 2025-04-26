import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UserData } from "../context/UserContext";

const EditAccount = () => {
  const navigate = useNavigate();
  const { user } = UserData();
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    profilePicture: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    const data = new FormData();
    if (formData.email) data.append("email", formData.email);
    if (formData.currentPassword)
      data.append("currentPassword", formData.currentPassword);
    if (formData.newPassword) data.append("newPassword", formData.newPassword);
    if (formData.profilePicture)
      data.append("profilePicture", formData.profilePicture);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/users/update-account",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      navigate(`/${user.role}/${user._id}`);
    } catch (error) {
      console.error("Error updating account:", error);
      toast.error(error.response?.data?.message || "Failed to update account");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#FDFEFE] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-4xl flex flex-col md:flex-row items-center">
        {/* Left side: Profile Picture */}
        <div className="flex flex-col items-center mb-6 md:mb-0 md:mr-10">
          <div className="relative">
            <img
              src={
                user.profilePicture
                  ? `http://localhost:5000/${user.profilePicture}`
                  : "https://via.placeholder.com/150"
              }
              alt="Profile"
              className="w-40 h-40 rounded-full object-cover border-4 border-[#E8EEF1]"
            />
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-4 text-sm text-[#2E4053]"
            />
          </div>
        </div>

        {/* Right side: Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-5">
          <div>
            <label className="block text-[#2E4053] font-medium mb-1">
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
            />
          </div>

          <div>
            <label className="block text-[#2E4053] font-medium mb-1">
              Current Password:
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="Enter current password"
              className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
            />
          </div>

          <div>
            <label className="block text-[#2E4053] font-medium mb-1">
              New Password:
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter new password"
              className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
            />
          </div>

          <div>
            <label className="block text-[#2E4053] font-medium mb-1">
              Confirm Password:
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1A2E46] hover:bg-[#58A6FF] text-white px-6 py-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
            >
              {loading ? "Saving..." : "Save Changes"}
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
  );
};

export default EditAccount;
