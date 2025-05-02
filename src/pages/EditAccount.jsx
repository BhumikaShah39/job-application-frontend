import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UserData } from "../context/UserContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const EditAccount = () => {
  const navigate = useNavigate();
  const { user } = UserData();

  const [accountData, setAccountData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    profilePicture: null,
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);

  useEffect(() => {
    if (user) {
      setAccountData((prev) => ({
        ...prev,
        email: user.email || "",
      }));
    }
  }, [user]);

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
    if (accountData.email) data.append("email", accountData.email);
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

  if (!user) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#FDFEFE] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold text-[#2E4053] text-center mb-8">
          Account Settings
        </h1>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-[#2E4053] mb-4">
            Update Account Details
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
                Email
              </label>
              <input
                type="email"
                name="email"
                value={accountData.email}
                onChange={handleAccountInputChange}
                className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                placeholder="Enter your email"
              />
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
      </div>
    </div>
  );
};

export default EditAccount;
