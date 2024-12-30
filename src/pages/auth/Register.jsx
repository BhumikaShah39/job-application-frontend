import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const job_application_backend = "http://localhost:5000";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user", // Default role
  });

  const [btnLoading, setBtnLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${job_application_backend}/api/auth/register`,
        formData
      );
      toast.success(data.message); // Success message from the backend
      setBtnLoading(false);
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || "Registration failed");
      setBtnLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FDFEFE] px-6 py-12">
      <div className="flex w-full max-w-5xl overflow-hidden bg-white shadow-lg rounded-lg">
        {/* Branding Section */}
        <div className="w-1/2 bg-[#E8EEF1] p-8 hidden md:flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-[#1A2E46]">
            Join Karya Today
          </h1>
          <p className="mt-4 text-lg text-[#2E4053]">
            Discover opportunities, track your progress, and connect with
            professionals. Start your journey now!
          </p>
          <img src="" alt="logo" className="mt-8 rounded-lg" />
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-center text-[#1A2E46]">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-center text-[#7F8C8D]">
            Please fill in the form below to register.
          </p>

          <form onSubmit={submitHandler} className="space-y-6 mt-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-[#2E4053]"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-[#E8EEF1] px-3 py-2 text-sm text-[#2E4053] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-[#2E4053]"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-[#E8EEF1] px-3 py-2 text-sm text-[#2E4053] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#2E4053]"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-[#E8EEF1] px-3 py-2 text-sm text-[#2E4053] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#2E4053]"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-lg border border-[#E8EEF1] px-3 py-2 text-sm text-[#2E4053] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-[#2E4053]"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-[#E8EEF1] px-3 py-2 text-sm text-[#2E4053] focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              >
                <option value="user">User</option>
                <option value="hirer">Hirer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={btnLoading}
              className={`w-full rounded-lg bg-[#1A2E46] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#58A6FF] focus:outline-none focus:ring-2 focus:ring-[#58A6FF] ${
                btnLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {btnLoading ? "Please Wait..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#7F8C8D]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-[#58A6FF] hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
