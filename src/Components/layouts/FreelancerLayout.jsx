import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  FaHome,
  FaUsers,
  FaChartBar,
  FaFolder,
  FaCalendar,
  FaBell,
  FaEnvelope,
  FaInfoCircle,
  FaUser, // Added for View My Profile icon
} from "react-icons/fa";
import io from "socket.io-client";
import axios from "axios";
import KaryaLogo from "../../assets/LogoWithText.png";

const socket = io("http://localhost:5000");

const FreelancerLayout = ({ children }) => {
  const { user } = UserData();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleLogoClick = (e) => {
    const currentPath = location.pathname;
    const dashboardPath = `/user/${user?._id}`;
    if (currentPath === dashboardPath) {
      e.preventDefault();
      console.log("Already on FreelancerDashboard, no navigation needed.");
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/notifications",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotifications(response.data);
        setUnreadCount(response.data.filter((n) => !n.isRead).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (user) {
      socket.emit("join", user._id.toString());
      socket.on("applicationStatusUpdate", (data) => {
        if (data.freelancerId === user._id.toString()) {
          setNotifications((prev) => [data, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      });
    }
    return () => {
      socket.off("applicationStatusUpdate");
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      await Promise.all(
        unreadNotifications.map((n) =>
          axios.put(
            `http://localhost:5000/api/notifications/${n._id}/read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const toggleNotificationDropdown = () => {
    setIsNotificationOpen((prev) => !prev);
    if (!isNotificationOpen) markAllAsRead();
  };

  const closeNotificationDropdown = () => setIsNotificationOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitial = user?.firstName?.charAt(0)?.toUpperCase() || "U";
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100">
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b bg-[#FDFEFE]">
          <Link
            to={`/user/${user?._id}`}
            onClick={handleLogoClick}
            className="inline-flex items-center"
          >
            <img src={KaryaLogo} alt="Karya" className="h-10 w-auto mr-2" />
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-[#1A2E46]"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-0 py-4 overflow-auto">
          <ul className="space-y-2">
            <li>
              <Link
                to={`/user/${user?._id}`}
                className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium ${
                  isActive(`/user/${user?._id}`)
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
                to={`/profile/${user?._id}`}
                className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium ${
                  isActive(`/profile/${user?._id}`)
                    ? "bg-[#D6E4FF] text-gray-500"
                    : "text-gray-500 hover:bg-[#D6E4FF]"
                }`}
              >
                <FaUser className="w-5 h-5 text-[#58A6FF]" />
                <span>View My Profile</span>
              </Link>
            </li>
            <li>
              <Link
                to={`/user/${user?._id}/applications`}
                className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium ${
                  isActive(`/user/${user?._id}/applications`)
                    ? "bg-[#D6E4FF] text-gray-500"
                    : "text-gray-500 hover:bg-[#D6E4FF]"
                }`}
              >
                <FaUsers className="w-5 h-5 text-[#58A6FF]" />
                <span>My Applications</span>
              </Link>
            </li>
            <li>
              <Link
                to={`/user/${user?._id}/analytics`}
                className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium ${
                  isActive(`/user/${user?._id}/analytics`)
                    ? "bg-[#D6E4FF] text-gray-500"
                    : "text-gray-500 hover:bg-[#D6E4FF]"
                }`}
              >
                <FaChartBar className="w-5 h-5 text-[#58A6FF]" />
                <span>Analytics</span>
              </Link>
            </li>
            <li>
              <Link
                to={`/user/${user?._id}/projects`}
                className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium ${
                  isActive(`/user/${user?._id}/projects`)
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
                to={`/user/${user?._id}/scheduled-meetings`}
                className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium ${
                  isActive(`/user/${user?._id}/scheduled-meetings`)
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
          onClick={toggleMobileMenu}
          className="fixed inset-0 bg-black bg-opacity-40 md:hidden"
        />
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="md:hidden p-4 bg-white shadow">
          <button onClick={toggleMobileMenu} className="text-[#1A2E46]">
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        <div className="bg-white shadow px-4 py-2 flex items-center justify-between">
          <div className="hidden md:block text-xl text-[#1A2E46] font-bold ml-2">
            Freelancer Dashboard
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={toggleNotificationDropdown}
                className="text-[#1A2E46] hover:text-[#58A6FF] relative"
              >
                <FaBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotificationOpen && notifications.length > 0 && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-lg rounded-md p-3 border border-gray-200 z-50">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-gray-800">Notifications</p>
                    <button
                      onClick={closeNotificationDropdown}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className="p-2 border-b last:border-none"
                    >
                      <p className="text-sm text-gray-800">{notif.message}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(notif.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-1"
              >
                <div className="w-8 h-8 bg-[#1A2E46] text-white rounded-full flex items-center justify-center font-bold">
                  {userInitial}
                </div>
                <span className="hidden sm:inline text-[#1A2E46]">
                  {user?.firstName || "Freelancer"}
                </span>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-50">
                  <Link
                    to={`/profile/${user?._id}`}
                    className="block px-4 py-2 text-sm text-[#1A2E46] hover:bg-gray-100"
                  >
                    View My Profile
                  </Link>
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
          </div>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default FreelancerLayout;
