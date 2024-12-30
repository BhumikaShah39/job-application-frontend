import React from "react";
import { Link } from "react-router-dom";
import TeamCollaboration from "../../assets/TeamCollaboration.jpg";

const Home = () => {
  return (
    <div className="relative bg-[#1A2E46] min-h-screen flex items-center justify-center">
      {/* Background Image with Blur and Tint */}
      <div className="absolute inset-0">
        <img
          src={TeamCollaboration}
          alt="Team Collaboration Background"
          className="w-full h-full object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-black opacity-60"></div>{" "}
        {/* Dark overlay */}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <p className="text-sm font-semibold text-[#58A6FF] uppercase tracking-wide mb-4">
          Revolutionizing the Freelancing Ecosystem
        </p>
        <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          Your Career Starts Here <br /> Unlock Endless Opportunities
        </h1>
        <p className="mt-4 text-lg text-gray-300 sm:text-xl">
          Connect with top hirers and showcase your skills. Our platform
          simplifies job searching, application tracking, and project
          management, helping freelancers and hirers thrive in a seamless
          ecosystem.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row sm:justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3 text-sm font-semibold bg-[#58A6FF] text-white rounded-lg shadow hover:bg-[#1A2E46]"
          >
            Get started
          </Link>
          <Link
            to="/learn-more"
            className="px-6 py-3 text-sm font-semibold border border-[#58A6FF] text-[#58A6FF] rounded-lg hover:bg-[#58A6FF] hover:text-white"
          >
            Learn more
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
