import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );
      toast.success(
        response.data.message || "Password reset link sent to your email"
      );
      navigate("/login");
    } catch (error) {
      console.error("Error in forgot password:", error);
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFEFE] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-center text-[#1A2E46]">
          Forgot Password
        </h2>
        <p className="mt-2 text-sm text-center text-[#7F8C8D]">
          Enter your email address to receive a password reset link.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-6 mt-8">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#2E4053]"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#E8EEF1] px-3 py-2 text-sm text-[#2E4053] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg bg-[#1A2E46] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#58A6FF] focus:outline-none focus:ring-2 focus:ring-[#58A6FF] ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#7F8C8D]">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="font-medium text-[#58A6FF] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
