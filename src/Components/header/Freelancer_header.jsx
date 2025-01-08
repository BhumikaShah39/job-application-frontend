import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import KaryaLogo from "../../assets/LogoWithText.png";

const FreelancerHeader = () => {
  const { user } = UserData();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-[#FDFEFE] shadow-md">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8"
        aria-label="Global"
      >
        {/* Logo */}
        <Link
          to={`/user/${user?._id}`}
          className="text-2xl font-bold text-[#1A2E46] hover:text-[#58A6FF]"
        >
          <div className="h-full flex items-center">
            <img src={KaryaLogo} className="h-16 w-auto" alt="Karya" />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-6">
          <Link
            to={`/user/${user?._id}/job-search`}
            className="text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
          >
            Job Search
          </Link>
          <Link
            to={`/user/${user?._id}/applications`}
            className="text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
          >
            Applications
          </Link>
          <Link
            to={`/user/${user?._id}/recommendations`}
            className="text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
          >
            Recommendations
          </Link>
          <Link
            to={`/user/${user?._id}/analytics`}
            className="text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
          >
            Analytics
          </Link>
          <Link
            to={`/user/${user?._id}/task-board`}
            className="text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
          >
            Task Board
          </Link>
        </div>

        <div className="lg:hidden">
          <button
            onClick={toggleMobileMenu}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-[#1A2E46]"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative hidden lg:flex items-center gap-x-4">
          <button
            onClick={toggleDropdown}
            className="relative flex items-center gap-x-2"
          >
            <div className="w-10 h-10 bg-[#1A2E46] rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.firstName?.charAt(0).toUpperCase() || "U"}
            </div>
          </button>

          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-14 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50"
            >
              <div className="py-2">
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
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-4 px-4 pb-4">
            <Link
              to="/user/job-search"
              className="block text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
            >
              Job Search
            </Link>
            <Link
              to="/user/applications"
              className="block text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
            >
              Applications
            </Link>
            <Link
              to="/user/recommendations"
              className="block text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
            >
              Recommendations
            </Link>
            <Link
              to="/user/analytics"
              className="block text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
            >
              Analytics
            </Link>
            <Link
              to="/user/task-board"
              className="block text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
            >
              Task Board
            </Link>
            <div className="border-t border-gray-200 pt-4">
              <Link
                to="/user/profile"
                className="block text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
              >
                View Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left text-sm font-medium text-red-500 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default FreelancerHeader;
