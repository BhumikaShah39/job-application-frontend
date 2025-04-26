// pages/hirer/EditHirerProfile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UserData } from "../../context/UserContext";

const EditHirerProfile = () => {
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        businessDetails: user.businessDetails || {
          companyName: "",
          industry: "",
          description: "",
          website: "",
        },
        pastWork: user.pastWork || [],
      });
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

  const addPastWork = () => {
    if (newPastWork.title && newPastWork.description && newPastWork.duration) {
      setFormData({
        ...formData,
        pastWork: [...formData.pastWork, newPastWork],
      });
      setNewPastWork({ title: "", description: "", duration: "" });
    } else {
      toast.error("Please fill all past work fields");
    }
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

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/users/update-hirer-profile",
        {
          businessDetails: JSON.stringify(formData.businessDetails),
          pastWork: JSON.stringify(formData.pastWork),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      navigate(`/hirer/${user._id}`);
    } catch (error) {
      console.error("Error updating hirer profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Hirer Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Business Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.businessDetails.companyName}
                onChange={handleBusinessInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Industry</label>
              <input
                type="text"
                name="industry"
                value={formData.businessDetails.industry}
                onChange={handleBusinessInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Description</label>
              <textarea
                name="description"
                value={formData.businessDetails.description}
                onChange={handleBusinessInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Website</label>
              <input
                type="url"
                name="website"
                value={formData.businessDetails.website}
                onChange={handleBusinessInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Past Work</h2>
          <div className="space-y-4">
            {formData.pastWork.map((work, index) => (
              <div key={index} className="border p-4 rounded">
                <p>
                  <strong>Title:</strong> {work.title}
                </p>
                <p>
                  <strong>Description:</strong> {work.description}
                </p>
                <p>
                  <strong>Duration:</strong> {work.duration}
                </p>
                <button
                  type="button"
                  onClick={() => removePastWork(index)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="space-y-2">
              <input
                type="text"
                name="title"
                value={newPastWork.title}
                onChange={handlePastWorkInputChange}
                placeholder="Project Title"
                className="w-full p-2 border rounded"
              />
              <textarea
                name="description"
                value={newPastWork.description}
                onChange={handlePastWorkInputChange}
                placeholder="Project Description"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="duration"
                value={newPastWork.duration}
                onChange={handlePastWorkInputChange}
                placeholder="Duration (e.g., Jan 2023 - Mar 2023)"
                className="w-full p-2 border rounded"
              />
              <button
                type="button"
                onClick={addPastWork}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Past Work
              </button>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default EditHirerProfile;
