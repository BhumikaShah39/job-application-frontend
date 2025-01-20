import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

const AddJobForm = ({ job_application_backend }) => {
  //get the job from the location state (edit mode)
  const location = useLocation();
  const job = location.state?.job || null;

  const [jobData, setJobData] = useState({
    title: "",
    company: "",
    workplaceType: "Onsite",
    location: "",
    jobType: "Full-time",
    category: "",
    subCategory: "",
    notificationPreference: "In-app",
    description: "",
  });

  useEffect(() => {
    console.log("Job Data:", job);
    // Will pre-fill form data if in edit mode
    if (job) {
      setJobData(job);
    }
  }, [job]);

  const categories = {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData({ ...jobData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      if (job) {
        // Update job
        await axios.put(
          `${job_application_backend}/api/jobs/update/${job._id}`,
          jobData,
          config
        );
        toast.success("Job updated successfully!");
      } else {
        // Add job
        await axios.post(
          `${job_application_backend}/api/jobs/add`,
          jobData,
          config
        );
        toast.success("Job added successfully!");
      }

      setJobData({
        title: "",
        company: "",
        workplaceType: "onsite",
        location: "",
        jobType: "full-time",
        category: "",
        subCategory: "",
        notificationPreference: "in-app",
        description: "",
      });
    } catch (error) {
      console.error(
        "Error submitting job:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || "Failed to submit job");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFEFE] items-center justify-center px-4 py-6">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-[#1A2E46] mb-6">
          {job ? "Edit Job" : "Add a New Job"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-[#2E4053]">
              Job Title
            </label>
            <input
              type="text"
              name="title"
              value={jobData.title}
              onChange={handleChange}
              placeholder="Enter job title"
              className="mt-2 w-full rounded-lg border border-[#E8EEF1] px-3 py-2 text-sm text-[#2E4053] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              required
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-[#2E4053]">
              Company
            </label>
            <input
              type="text"
              name="company"
              value={jobData.company}
              onChange={handleChange}
              placeholder="Enter company name"
              className="mt-2 w-full rounded-lg border border-[#E8EEF1] px-3 py-2 text-sm text-[#2E4053] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              required
            />
          </div>

          {/* Workplace Type */}
          <div>
            <label
              htmlFor="workplaceType"
              className="block text-sm font-medium text-[#2E4053]"
            >
              Workplace Type
            </label>
            <Menu as="div" className="relative inline-block w-full mt-2">
              <Menu.Button className="inline-flex w-full justify-between rounded-lg bg-white px-3 py-2 border border-[#E8EEF1] text-sm font-semibold text-[#2E4053] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#58A6FF]">
                {jobData.workplaceType || "Select Workplace Type"}
                <ChevronDownIcon
                  aria-hidden="true"
                  className="h-5 w-5 text-[#2E4053]"
                />
              </Menu.Button>
              <Menu.Items className="absolute left-0 z-10 mt-2 w-full origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                {["Onsite", "Remote", "Hybrid"].map((type) => (
                  <Menu.Item key={type}>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={() =>
                          setJobData({ ...jobData, workplaceType: type })
                        }
                        className={`${
                          active
                            ? "bg-gray-200 text-[#2E4053]"
                            : "text-[#2E4053]"
                        } block px-4 py-2 w-full text-left text-sm`}
                      >
                        {type}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Menu>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-[#2E4053]">
              Employee Location
            </label>
            <input
              type="text"
              name="location"
              value={jobData.location}
              onChange={handleChange}
              placeholder="Enter location"
              className="mt-2 w-full rounded-lg border border-[#E8EEF1] px-3 py-2 text-sm text-[#2E4053] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              required
            />
          </div>

          {/* Job Type */}
          <div>
            <label
              htmlFor="jobType"
              className="block text-sm font-medium text-[#2E4053]"
            >
              Job Type
            </label>
            <Menu as="div" className="relative inline-block w-full mt-2">
              <Menu.Button className="inline-flex w-full justify-between rounded-lg bg-white px-3 py-2 border border-[#E8EEF1] text-sm font-semibold text-[#2E4053] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#58A6FF]">
                {jobData.jobType || "Select Job Type"}
                <ChevronDownIcon
                  aria-hidden="true"
                  className="h-5 w-5 text-[#2E4053]"
                />
              </Menu.Button>
              <Menu.Items className="absolute left-0 z-10 mt-2 w-full origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                {["Full-time", "Part-time", "Freelance"].map((type) => (
                  <Menu.Item key={type}>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={() =>
                          setJobData({ ...jobData, jobType: type })
                        }
                        className={`${
                          active
                            ? "bg-gray-200 text-[#2E4053]"
                            : "text-[#2E4053]"
                        } block px-4 py-2 w-full text-left text-sm`}
                      >
                        {type}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Menu>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-[#2E4053]"
            >
              Category
            </label>
            <Menu as="div" className="relative inline-block w-full mt-2">
              <Menu.Button className="inline-flex w-full justify-between rounded-lg bg-white px-3 py-2 border border-[#E8EEF1] text-sm font-semibold text-[#2E4053] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#58A6FF]">
                {jobData.category || "Select a Category"}
                <ChevronDownIcon
                  aria-hidden="true"
                  className="h-5 w-5 text-[#2E4053]"
                />
              </Menu.Button>
              <Menu.Items className="absolute left-0 z-10 mt-2 w-full origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                {Object.keys(categories).map((category) => (
                  <Menu.Item key={category}>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={() =>
                          setJobData({ ...jobData, category, subCategory: "" })
                        }
                        className={`${
                          active
                            ? "bg-gray-200 text-[#2E4053]"
                            : "text-[#2E4053]"
                        } block px-4 py-2 w-full text-left text-sm`}
                      >
                        {category}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Menu>
          </div>

          {/* Subcategory */}
          <div className="mb-4">
            <label
              htmlFor="subCategory"
              className="block text-sm font-medium text-[#2E4053]"
            >
              Subcategory
            </label>
            <Menu as="div" className="relative inline-block w-full mt-2">
              <Menu.Button className="inline-flex w-full justify-between rounded-lg bg-white px-3 py-2 border border-[#E8EEF1] text-sm font-semibold text-[#2E4053] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#58A6FF]">
                {jobData.subCategory || "Select a Subcategory"}
                <ChevronDownIcon
                  aria-hidden="true"
                  className="h-5 w-5 text-[#2E4053]"
                />
              </Menu.Button>
              <Menu.Items className="absolute left-0 z-10 mt-2 w-full origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                {categories[jobData.category]?.map((subCategory) => (
                  <Menu.Item key={subCategory}>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={() => setJobData({ ...jobData, subCategory })}
                        className={`${
                          active
                            ? "bg-gray-200 text-[#2E4053]"
                            : "text-[#2E4053]"
                        } block px-4 py-2 w-full text-left text-sm`}
                      >
                        {subCategory}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Menu>
          </div>

          {/* Notification Preference */}
          <div>
            <label
              htmlFor="notificationPreference"
              className="block text-sm font-medium text-[#2E4053]"
            >
              Notification Preference
            </label>
            <Menu as="div" className="relative inline-block w-full mt-2">
              <Menu.Button className="inline-flex w-full justify-between rounded-lg bg-white px-3 py-2 border border-[#E8EEF1] text-sm font-semibold text-[#2E4053] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#58A6FF]">
                {jobData.notificationPreference ||
                  "Select Notification Preference"}
                <ChevronDownIcon
                  aria-hidden="true"
                  className="h-5 w-5 text-[#2E4053]"
                />
              </Menu.Button>
              <Menu.Items className="absolute left-0 z-10 mt-2 w-full origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                {["In-App", "Email", "Both"].map((preference) => (
                  <Menu.Item key={preference}>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={() =>
                          setJobData({
                            ...jobData,
                            notificationPreference: preference,
                          })
                        }
                        className={`${
                          active
                            ? "bg-gray-200 text-[#2E4053]"
                            : "text-[#2E4053]"
                        } block px-4 py-2 w-full text-left text-sm`}
                      >
                        {preference}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Menu>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-[#2E4053]">
              Job Description
            </label>
            <input
              type="text"
              name="description"
              value={jobData.description || ""}
              onChange={handleChange}
              placeholder="Enter job description"
              className="mt-2 w-full rounded-lg border border-[#E8EEF1] px-3 py-4 text-sm text-[#2E4053] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              rows={15} // Set default height to display more text
              style={{
                resize: "none", // Prevent resizing
                whiteSpace: "pre-wrap", // Preserve line breaks and spacing
              }}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#1A2E46] text-white py-2 px-4 rounded-lg hover:bg-[#58A6FF] focus:outline-none focus:ring-2 focus:ring-[#58A6FF] focus:ring-offset-2"
          >
            {job ? "Update Job" : "Add Job"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddJobForm;
