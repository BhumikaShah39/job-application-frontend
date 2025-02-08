// HirerLayout.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { FaBell } from "react-icons/fa";
import { useNotifications } from "../../context/NotificationContext";
import axios from "axios";

import KaryaLogo from "../../assets/LogoWithText.png";

const HirerLayout = ({ children }) => {
  const { user } = UserData();
  const { notifications, fetchNotifications } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const unreadNotifications = notifications.filter(
        (notif) => !notif.isRead
      );

      await Promise.all(
        unreadNotifications.map((notif) =>
          axios.put(
            `http://localhost:5000/api/notifications/${notif._id}/read`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` }, // Include auth header
            }
          )
        )
      );

      fetchNotifications();
    } catch (error) {
      console.error(
        "Failed to mark notifications as read:",
        error.response?.data || error
      );
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    if (!isDropdownOpen) {
      markAllAsRead();
      setUnreadCount(0); // Mark notifications as viewed
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen((prev) => !prev);
  };

  useEffect(() => {
    const unreadNotifications = notifications.filter((notif) => !notif.isRead);
    setUnreadCount(unreadNotifications.length);
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const userInitial = user?.firstName?.charAt(0)?.toUpperCase() || "H";

  return (
    <div className="flex h-screen bg-gray-100">
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md
          transform transition-transform duration-200 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static
        `}
      >
        <div className="flex items-center justify-between p-4 border-b bg-[#FDFEFE]">
          <Link to={`/hirer/${user?._id}`} className="inline-flex items-center">
            <img src={KaryaLogo} className="h-10 w-auto mr-2" alt="Karya" />
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-[#1A2E46]"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

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
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      <div className="flex flex-col flex-1">
        <div className="bg-white shadow px-4 py-2 flex items-center justify-between">
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="text-[#1A2E46]">
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>

          <div className="hidden md:block text-xl text-[#1A2E46] font-bold ml-2">
            Hirer Dashboard
          </div>

          <div className="flex items-center space-x-4 relative">
            <button
              className="text-[#1A2E46] hover:text-[#58A6FF] relative"
              title="Notifications"
              onClick={toggleDropdown}
              ref={notificationRef}
            >
              <FaBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {isDropdownOpen && (
              <div
                ref={notificationRef}
                className="absolute right-0 mt-40 w-64 bg-white shadow-lg rounded-md p-3 border border-gray-200 z-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-gray-800">Notifications</p>
                  <button
                    onClick={() => setIsDropdownOpen(false)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center">
                    No new notifications
                  </p>
                ) : (
                  notifications.map((notif, index) => (
                    <div
                      key={index}
                      className="p-2 border-b last:border-none cursor-pointer hover:bg-gray-100"
                    >
                      <p className="text-sm text-gray-800">{notif.message}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(notif.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

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

        <div className="p-4 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default HirerLayout;
