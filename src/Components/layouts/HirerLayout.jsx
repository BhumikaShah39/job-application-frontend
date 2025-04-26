// job-application-frontend/src/Components/layouts/HirerLayout.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  FaBell,
  FaHome,
  FaPlus,
  FaUsers,
  FaBell as FaBellIcon,
  FaFolder,
  FaCalendar,
  FaEnvelope,
  FaInfoCircle,
} from "react-icons/fa";
import { useNotifications } from "../../context/NotificationContext";
import axios from "axios";
import KaryaLogo from "../../assets/LogoWithText.png";

const HirerLayout = ({ children }) => {
  const { user } = UserData();
  const { notifications, fetchNotifications } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const unreadNotifications = notifications.filter((notif) => !notif.isRead);
    setUnreadCount(unreadNotifications.length);
  }, [notifications]);

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
              headers: { Authorization: `Bearer ${token}` },
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

  const toggleApplicationsMenu = () => {
    setIsApplicationsOpen((prev) => !prev);
  };

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

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isViewApplicationsActive =
    isActive(`/hirer/${user?._id}/applications`) ||
    isActive(`/hirer/${user?._id}/applications/accepted`);

  return (
    <div className="flex h-screen bg-gray-100">
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md
          transform transition-transform duration-200 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static flex flex-col
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

        <nav className="flex-1 px-0 py-4 overflow-auto">
          <ul className="space-y-2">
            <li>
              <Link
                to={`/hirer/${user?._id}`}
                className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium ${
                  isActive(`/hirer/${user?._id}`)
                    ? "bg-[#D6E4FF] text-gray-500"
                    : "text-gray-500 hover:bg-[#D6E4FF]"
                }`}
              >
                <FaHome className="w-5 h-5 text-[#58A6FF]" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                to={`/hirer/${user?._id}/add-jobs`}
                className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium ${
                  isActive(`/hirer/${user?._id}/add-jobs`)
                    ? "bg-[#D6E4FF] text-gray-500"
                    : "text-gray-500 hover:bg-[#D6E4FF]"
                }`}
              >
                <FaPlus className="w-5 h-5 text-[#58A6FF]" />
                <span>Add Jobs</span>
              </Link>
            </li>
            <li>
              <button
                onClick={toggleApplicationsMenu}
                className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium w-full text-left ${
                  isViewApplicationsActive
                    ? "bg-[#D6E4FF] text-gray-500"
                    : "text-gray-500 hover:bg-[#D6E4FF]"
                }`}
              >
                <FaUsers className="w-5 h-5 text-[#58A6FF]" />
                <span>View Applications</span>
              </button>
              {isApplicationsOpen && (
                <ul className="pl-8 mt-1 space-y-1">
                  <li>
                    <Link
                      to={`/hirer/${user?._id}/applications`}
                      className={`block py-2 px-4 text-sm font-medium ${
                        isActive(`/hirer/${user?._id}/applications`)
                          ? "text-[#58A6FF] font-bold"
                          : "text-gray-500 hover:text-[#58A6FF]"
                      }`}
                    >
                      All Applications
                    </Link>
                  </li>
                  <li>
                    <Link
                      to={`/hirer/${user?._id}/applications/accepted`}
                      className={`block py-2 px-4 text-sm font-medium ${
                        isActive(`/hirer/${user?._id}/applications/accepted`)
                          ? "text-[#58A6FF] font-bold"
                          : "text-gray-500 hover:text-[#58A6FF]"
                      }`}
                    >
                      Accepted Applications
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <Link
                to={`/hirer/${user?._id}/notifications`}
                className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium ${
                  isActive(`/hirer/${user?._id}/notifications`)
                    ? "bg-[#D6E4FF] text-gray-500"
                    : "text-gray-500 hover:bg-[#D6E4FF]"
                }`}
              >
                <FaBellIcon className="w-5 h-5 text-[#58A6FF]" />
                <span>Notifications</span>
              </Link>
            </li>
            <li>
              <Link
                to={`/hirer/${user?._id}/projects`}
                className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium ${
                  isActive(`/hirer/${user?._id}/projects`)
                    ? "bg-[#D6E4FF] text-gray-500"
                    : "text-gray-500 hover:bg-[#D6E4FF]"
                }`}
              >
                <FaFolder className="w-5 h-5 text-[#58A6FF]" />
                <span>Projects</span>
              </Link>
            </li>
            <li>
              <Link
                to={`/hirer/${user?._id}/scheduled-meetings`}
                className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium ${
                  isActive(`/hirer/${user?._id}/scheduled-meetings`)
                    ? "bg-[#D6E4FF] text-gray-500"
                    : "text-gray-500 hover:bg-[#D6E4FF]"
                }`}
              >
                <FaCalendar className="w-5 h-5 text-[#58A6FF]" />
                <span>Scheduled Meetings</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t mt-auto">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">
            Documentation
          </p>
          <ul className="space-y-2">
            <li>
              <Link
                to="/contact-us"
                className="flex items-center space-x-2 py-2 px-4 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <FaEnvelope className="w-5 h-5 text-gray-500" />
                <span>Contact Us</span>
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="flex items-center space-x-2 py-2 px-4 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <FaInfoCircle className="w-5 h-5 text-gray-500" />
                <span>About</span>
              </Link>
            </li>
          </ul>
        </div>
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
            {user?.role === "freelancer"
              ? "Freelancer Dashboard"
              : "Hirer Dashboard"}
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
                className="absolute right-0 top-full mt-2 w-64 bg-white shadow-lg rounded-md p-3 border border-gray-200 z-50"
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
                    to={`/hirer/${user?._id}/edit-account`}
                    onClick={() => setIsProfileOpen(false)}
                    className="block px-4 py-2 text-sm text-[#1A2E46] hover:bg-gray-100"
                  >
                    Edit Account
                  </Link>
                  <Link
                    to={`/hirer/${user?._id}/edit-profile`}
                    onClick={() => setIsProfileOpen(false)}
                    className="block px-4 py-2 text-sm text-[#1A2E46] hover:bg-gray-100"
                  >
                    Edit Profile
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
