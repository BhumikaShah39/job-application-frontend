import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UserData } from "../../context/UserContext";

const ManageBusinessProfile = () => {
  const navigate = useNavigate();
  const { user } = UserData();
  const [formData, setFormData] = useState({
    businessDetails: {
      companyName: "",
      industry: "",
      description: "",
      website: "",
    },
    pastWork: [],
  });
  const [newPastWork, setNewPastWork] = useState({
    title: "",
    description: "",
    duration: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editPastWork, setEditPastWork] = useState({
    title: "",
    description: "",
    duration: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch user data from the database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/users/${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const userData = response.data.user;
        setFormData({
          businessDetails: userData.businessDetails || {
            companyName: "",
            industry: "",
            description: "",
            website: "",
          },
          pastWork: userData.pastWork || [],
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data");
      } finally {
        setFetching(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleBusinessInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      businessDetails: { ...formData.businessDetails, [name]: value },
    });
  };

  const handlePastWorkInputChange = (e) => {
    const { name, value } = e.target;
    setNewPastWork({ ...newPastWork, [name]: value });
  };

  const handleEditPastWorkChange = (e) => {
    const { name, value } = e.target;
    setEditPastWork({ ...editPastWork, [name]: value });
  };

  const addPastWork = () => {
    if (newPastWork.title && newPastWork.description && newPastWork.duration) {
      setFormData({
        ...formData,
        pastWork: [newPastWork, ...formData.pastWork],
      });
      setNewPastWork({ title: "", description: "", duration: "" });
    } else {
      toast.error("Please fill all past work fields");
    }
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditPastWork({ ...formData.pastWork[index] });
  };

  const saveEdit = (index) => {
    if (
      editPastWork.title &&
      editPastWork.description &&
      editPastWork.duration
    ) {
      const updatedPastWork = [...formData.pastWork];
      updatedPastWork[index] = editPastWork;
      setFormData({
        ...formData,
        pastWork: updatedPastWork,
      });
      setEditingIndex(null);
      setEditPastWork({ title: "", description: "", duration: "" });
    } else {
      toast.error("Please fill all fields to save changes");
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditPastWork({ title: "", description: "", duration: "" });
  };

  const removePastWork = (index) => {
    setFormData({
      ...formData,
      pastWork: formData.pastWork.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      businessDetails: formData.businessDetails,
      pastWork: formData.pastWork,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/users/update-hirer-profile",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(response.data.message);
      setTimeout(() => {
        navigate(`/hirer/${user._id}`);
      }, 1000); // Delay navigation to ensure toast is visible
    } catch (error) {
      console.error("Error updating business profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
      setLoading(false); // Ensure loading is set to false in the catch block
    }
  };

  if (!user || fetching)
    return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#FDFEFE] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <h1 className="text-2xl font-bold text-[#2E4053] mb-6">
            Manage Business Profile
          </h1>

          {/* Business Details */}
          <div>
            <h2 className="text-lg font-medium text-[#2E4053] mb-2">
              Business Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[#2E4053] font-medium mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.businessDetails.companyName}
                  onChange={handleBusinessInputChange}
                  className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                />
              </div>
              <div>
                <label className="block text-[#2E4053] font-medium mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.businessDetails.industry}
                  onChange={handleBusinessInputChange}
                  className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                />
              </div>
              <div>
                <label className="block text-[#2E4053] font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.businessDetails.description}
                  onChange={handleBusinessInputChange}
                  className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                />
              </div>
              <div>
                <label className="block text-[#2E4053] font-medium mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.businessDetails.website}
                  onChange={handleBusinessInputChange}
                  className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                />
              </div>
            </div>
          </div>

          {/* Past Work */}
          <div>
            <h2 className="text-lg font-medium text-[#2E4053] mb-2">
              Past Work
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  name="title"
                  value={newPastWork.title}
                  onChange={handlePastWorkInputChange}
                  placeholder="Project Title"
                  className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                />
                <textarea
                  name="description"
                  value={newPastWork.description}
                  onChange={handlePastWorkInputChange}
                  placeholder="Project Description"
                  className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                />
                <input
                  type="text"
                  name="duration"
                  value={newPastWork.duration}
                  onChange={handlePastWorkInputChange}
                  placeholder="Duration (e.g., Jan 2023 - Mar 2023)"
                  className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                />
                <button
                  type="button"
                  onClick={addPastWork}
                  className="bg-[#58A6FF] hover:bg-[#1A2E46] text-white px-4 py-2 rounded-lg transition-all"
                >
                  Add Past Work
                </button>
              </div>
              {formData.pastWork.map((work, index) => (
                <div
                  key={index}
                  className="border border-[#E8EEF1] p-4 rounded-md shadow-sm"
                >
                  {editingIndex === index ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="title"
                        value={editPastWork.title}
                        onChange={handleEditPastWorkChange}
                        className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                      />
                      <textarea
                        name="description"
                        value={editPastWork.description}
                        onChange={handleEditPastWorkChange}
                        className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                      />
                      <input
                        type="text"
                        name="duration"
                        value={editPastWork.duration}
                        onChange={handleEditPastWorkChange}
                        className="w-full px-4 py-2 border border-[#E8EEF1] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58A6FF] text-[#2E4053]"
                      />
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(index)}
                          className="bg-[#58A6FF] hover:bg-[#1A2E46] text-white px-4 py-2 rounded-lg transition-all"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="border border-[#E8EEF1] hover:bg-gray-100 text-[#2E4053] px-4 py-2 rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[#2E4053]">
                        <strong>Title:</strong> {work.title}
                      </p>
                      <p className="text-[#2E4053]">
                        <strong>Description:</strong> {work.description}
                      </p>
                      <p className="text-[#2E4053]">
                        <strong>Duration:</strong> {work.duration}
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <button
                          type="button"
                          onClick={() => startEditing(index)}
                          className="text-blue-500 hover:underline text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removePastWork(index)}
                          className="text-red-500 hover:underline text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
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

export default ManageBusinessProfile;
