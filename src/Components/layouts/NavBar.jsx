// src/Components/layouts/NavBar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBell, FaUserCircle } from "react-icons/fa";
import { UserData } from "../../context/UserContext";

function NavBar() {
  const { user } = UserData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");

    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow">
      <nav className="mx-auto flex items-center justify-between p-4">
        {/* Left side brand (optional) */}
        <Link to="/" className="text-xl font-bold text-gray-800">
          Karya
        </Link>

        {/* Right side icons */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            className="relative text-gray-600 hover:text-gray-800"
            title="Notifications"
          >
            <FaBell className="text-xl" />
            {/* If you have a notification count, put a badge here */}
          </button>

          {/* Profile menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
            >
              <FaUserCircle className="text-2xl" />
              {/* Show user name or role */}
              <span className="hidden sm:inline">
                {user?.firstName || "Profile"}
              </span>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-10">
                <Link
                  to={`/hirer/${user?._id}`} // or your own profile route
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default NavBar;
