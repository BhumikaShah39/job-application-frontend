import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { btnLoading, login } = UserData();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log("Form submitted with email:", email, "and password:", password);

    // 1) Check if email is empty
    if (!email.trim()) {
      toast.error("Email cannot be empty");
      return;
    }

    // 2) Check if password is empty
    if (!password.trim()) {
      toast.error("Password cannot be empty");
      return;
    }

    try {
      console.log("Calling login function...");
      await login(email, password, navigate);
      console.log("Login function completed, navigation should have occurred.");
    } catch (error) {
      console.error("Error in submitHandler:", error);
      toast.error("An unexpected error occurred during login.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFEFE] items-center justify-center px-6 py-12">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-center text-[#1A2E46]">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-center text-[#7F8C8D]">
          Welcome back! Please enter your credentials to continue.
        </p>

        {/* Use noValidate on the form if you want to avoid the native HTML5 popups */}
        <form onSubmit={submitHandler} noValidate className="space-y-6 mt-8">
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
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#E8EEF1] px-3 py-2 text-sm text-[#2E4053] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#2E4053]"
              >
                Password
              </label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#E8EEF1] px-3 py-2 text-sm text-[#2E4053] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#58A6FF]"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={btnLoading}
            className={`w-full rounded-lg bg-[#1A2E46] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#58A6FF] focus:outline-none focus:ring-2 focus:ring-[#58A6FF] ${
              btnLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {btnLoading ? "Please Wait..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#7F8C8D]">
          Not a member?{" "}
          <Link
            to="/register"
            className="font-medium text-[#58A6FF] hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
