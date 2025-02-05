// HirerLayout.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { FaBell } from "react-icons/fa"; // <-- for the notification icon
import KaryaLogo from "../../assets/LogoWithText.png";

const HirerLayout = ({ children }) => {
  const { user } = UserData();
  const navigate = useNavigate();

  // For toggling the sidebar on mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // For the top bar profile dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Toggle the sidebar on mobile
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  // Toggle the top bar profile dropdown
  const toggleProfileDropdown = () => {
    setIsProfileOpen((prev) => !prev);
  };

  // Close profile dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Display initial if user has no firstName
  const userInitial = user?.firstName?.charAt(0)?.toUpperCase() || "H";

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
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b bg-[#FDFEFE]">
          <Link to={`/hirer/${user?._id}`} className="inline-flex items-center">
            <img src={KaryaLogo} className="h-10 w-auto mr-2" alt="Karya" />
          </Link>
          {/* Close button on mobile */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-[#1A2E46]"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 overflow-auto">
          <ul className="space-y-4">
            <li>
              <Link
                to={`/hirer/${user?._id}/add-jobs`}
                className="block text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
              >
                Add Jobs
              </Link>
            </li>
            <li>
              <Link
                to={`/hirer/${user?._id}/applications`}
                className="block text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
              >
                View Applications
              </Link>
            </li>
            <li>
              <Link
                to={`/hirer/${user?._id}/analytics`}
                className="block text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
              >
                Analytics
              </Link>
            </li>
            <li>
              <Link
                to={`/hirer/${user?._id}/notifications`}
                className="block text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
              >
                Notifications
              </Link>
            </li>
            <li>
              <Link
                to={`/hirer/${user?._id}/projects`}
                className="block text-sm font-medium text-[#1A2E46] hover:text-[#58A6FF]"
              >
                Projects
              </Link>
            </li>
          </ul>
        </nav>

        {/* 
          If you no longer want a "Profile" dropdown at the bottom of the sidebar,
          you can remove this entire block. We'll rely on the top bar for profile.
        */}
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* RIGHT SIDE: WRAPPER FOR TOP BAR & CONTENT */}
      <div className="flex flex-col flex-1">
        {/* TOP BAR */}
        <div className="bg-white shadow px-4 py-2 flex items-center justify-between">
          {/* Hamburger button (mobile) to open sidebar */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="text-[#1A2E46]">
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>

          {/* Page Title or brand in center (optional) */}
          <div className="hidden md:block text-xl text-[#1A2E46] font-bold ml-2">
            Hirer Dashboard
          </div>

          {/* Right side: Notification + Profile */}
          <div className="flex items-center space-x-4 relative">
            {/* Notification Icon */}
            <button
              className="text-[#1A2E46] hover:text-[#58A6FF]"
              title="Notifications"
            >
              <FaBell className="w-5 h-5" />
              {/* If you want a badge, you can add it here */}
            </button>

            {/* Profile Avatar & Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={toggleProfileDropdown}
                className="flex items-center space-x-1"
              >
                <div className="w-8 h-8 bg-[#1A2E46] text-white rounded-full flex items-center justify-center font-bold">
                  {userInitial}
                </div>
                <span className="hidden sm:inline text-[#1A2E46]">
                  {user?.firstName || "Hirer"}
                </span>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-50">
                  <Link
                    to={`/hirer/${user?._id}/profile`}
                    onClick={() => setIsProfileOpen(false)}
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
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="p-4 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default HirerLayout;
