// pages/freelancer/AddEnhancements.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UserData } from "../../context/UserContext";

const AddEnhancements = () => {
  const navigate = useNavigate();
  const { user } = UserData();
  const [formData, setFormData] = useState({
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
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      details: { ...formData.details, [name]: value },
    });
  };

  const handleTypeChange = (e) => {
    setFormData({
      ...formData,
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
    setFiles([]);
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("type", formData.type);
    data.append("details", JSON.stringify(formData.details));
    for (let i = 0; i < files.length; i++) {
      data.append("images", files[i]);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/users/add-enhancement",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message);
      navigate(`/user/${user._id}`);
    } catch (error) {
      console.error("Error adding enhancement:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to add enhancement";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">
        Add Certifications, Achievements, or Portfolio
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleTypeChange}
            className="w-full p-2 border rounded"
          >
            <option value="certification">Certification</option>
            <option value="achievement">Achievement</option>
            <option value="portfolio">Portfolio</option>
          </select>
        </div>

        {formData.type === "certification" && (
          <>
            <div>
              <label className="block text-sm font-semibold">
                Certification Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.details.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Issuer</label>
              <input
                type="text"
                name="issuer"
                value={formData.details.issuer}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Issue Date</label>
              <input
                type="date"
                name="issueDate"
                value={formData.details.issueDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">
                Certificate Image (Optional)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </>
        )}

        {formData.type === "achievement" && (
          <>
            <div>
              <label className="block text-sm font-semibold">
                Achievement Title
              </label>
              <input
                type="text"
                name="name"
                value={formData.details.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Description</label>
              <textarea
                name="description"
                value={formData.details.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Date</label>
              <input
                type="date"
                name="issueDate"
                value={formData.details.issueDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </>
        )}

        {formData.type === "portfolio" && (
          <>
            <div>
              <label className="block text-sm font-semibold">
                Project Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.details.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">Description</label>
              <textarea
                name="description"
                value={formData.details.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">
                Technologies (Comma-separated)
              </label>
              <input
                type="text"
                name="technologies"
                value={formData.details.technologies.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    details: {
                      ...formData.details,
                      technologies: e.target.value
                        .split(",")
                        .map((t) => t.trim()),
                    },
                  })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">
                Project Link (Optional)
              </label>
              <input
                type="url"
                name="link"
                value={formData.details.link}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold">
                Project Images (Optional)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Enhancement"}
        </button>
      </form>
    </div>
  );
};

export default AddEnhancements;
