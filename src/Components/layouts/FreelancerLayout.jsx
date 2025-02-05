// src/Components/layouts/FreelancerLayout.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import KaryaLogo from "../../assets/LogoWithText.png";

const FreelancerLayout = ({ children }) => {
  const { user } = UserData();
  const navigate = useNavigate();

  // Mobile sidebar toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Profile dropdown toggle
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Close dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitial = user?.firstName?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md
          transform transition-transform duration-200 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static
        `}
      >
        {/* Sidebar Header / Logo */}
        <div className="flex items-center justify-between p-4 border-b bg-[#FDFEFE]">
          <Link to={`/user/${user?._id}`} className="inline-flex items-center">
            <img src={KaryaLogo} alt="Karya" className="h-10 w-auto mr-2" />
          </Link>
          {/* Mobile: close button */}
          <button
            className="md:hidden p-2 text-[#1A2E46]"
            onClick={toggleMobileMenu}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 overflow-auto">
          <ul className="space-y-4">
            <li>
              <Link
                to={`/user/${user?._id}/job-search`}
                className="block text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
              >
                Job Search
              </Link>
            </li>
            <li>
              <Link
                to={`/user/${user?._id}/applications`}
                className="block text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
              >
                Applications
              </Link>
            </li>
            <li>
              <Link
                to={`/user/${user?._id}/recommendations`}
                className="block text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
              >
                Recommendations
              </Link>
            </li>
            <li>
              <Link
                to={`/user/${user?._id}/analytics`}
                className="block text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
              >
                Analytics
              </Link>
            </li>
            <li>
              <Link
                to={`/user/${user?._id}/task-board`}
                className="block text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
              >
                Task Board
              </Link>
            </li>
          </ul>
        </nav>

        {/* Profile Dropdown */}
        <div className="p-4 border-t" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center w-full bg-[#1A2E46] text-white px-3 py-2 rounded justify-center"
          >
            <div className="w-8 h-8 bg-white rounded-full text-[#1A2E46] flex items-center justify-center font-bold mr-2">
              {userInitial}
            </div>
            <span className="text-sm font-medium">
              {user?.firstName || "Freelancer"}
            </span>
          </button>

          {isDropdownOpen && (
            <div className="mt-2 bg-white shadow-md rounded-md py-2 z-50">
              <Link
                to="/user/profile"
                className="block px-4 py-2 text-sm text-[#1A2E46] hover:bg-gray-100"
              >
                View Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isMobileMenuOpen && (
        <div
          onClick={toggleMobileMenu}
          className="fixed inset-0 bg-black bg-opacity-40 md:hidden"
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto">
        {/* Mobile hamburger button if sidebar is closed */}
        <div className="md:hidden p-4 bg-white shadow">
          <button onClick={toggleMobileMenu} className="text-[#1A2E46]">
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Render the 'children' passed to this layout */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default FreelancerLayout;
