import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserData } from "../context/UserContext";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import {
  FiMoreVertical,
  FiEdit,
  FiXCircle,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import { io } from "socket.io-client";

const ScheduledMeetings = () => {
  const { user } = UserData();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newSchedule, setNewSchedule] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/interviews",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Fetched meetings:", response.data);
        setMeetings(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching meetings:", error);
        setLoading(false);
      }
    };

    fetchMeetings();

    const socket = io("http://localhost:5000");
    socket.on("connect", () => {
      console.log("Connected to Socket.IO server:", socket.id);
    });

    socket.on("interviewStatusUpdate", (data) => {
      console.log("Received status update:", data);
      setMeetings((prev) =>
        prev.map((m) =>
          m._id === data.interviewId ? { ...m, status: data.status } : m
        )
      );
      toast.info(data.message);
    });

    socket.on("interviewCancelled", (data) => {
      console.log("Received cancellation notification:", data);
      setMeetings((prev) =>
        prev.map((m) =>
          m._id === data.interviewId ? { ...m, status: "Cancelled" } : m
        )
      );
      toast.info(data.message);
    });

    socket.on("applicationStatusUpdate", (data) => {
      console.log("Received application status update:", data);
      toast.info(data.message);
    });

    return () => {
      socket.disconnect();
      console.log("Disconnected from Socket.IO server");
    };
  }, []);

  const now = new Date();
  const upcoming = meetings.filter((m) => {
    const scheduledTime = new Date(m.scheduledTime);
    return scheduledTime >= now && m.status === "Scheduled";
  });

  const past = meetings.filter((m) => {
    const scheduledTime = new Date(m.scheduledTime);
    return scheduledTime < now || m.status !== "Scheduled";
  });

  const getOtherUser = (meeting) => {
    return user._id === meeting.createdBy._id
      ? meeting.applicationId.userId
      : meeting.createdBy;
  };

  const handleReschedule = async () => {
    setRescheduling(true);
    try {
      const localDate = new Date(newSchedule);
      const utcDate = localDate.toISOString();

      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/interviews/${rescheduleModal._id}`,
        { scheduledTime: utcDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeetings((prev) =>
        prev.map((m) =>
          m._id === res.data.interview._id ? res.data.interview : m
        )
      );
      setRescheduleModal(null);
      toast.success("Meeting rescheduled!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reschedule meeting.");
    } finally {
      setRescheduling(false);
    }
  };

  const handleCancelMeeting = async (id) => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `http://localhost:5000/api/interviews/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { cancelReason },
        }
      );
      setMeetings((prev) =>
        prev.map((m) =>
          m._id === res.data.interview._id ? res.data.interview : m
        )
      );
      setShowCancelConfirm(null);
      setCancelReason("");
      toast.success("Meeting cancelled!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel meeting.");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/interviews/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeetings((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: status } : m))
      );
      toast.success(`Meeting marked as ${status}!`);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleConfirmHire = async (applicationId, meetingId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/applications/${applicationId}/confirm-hire`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeetings((prev) =>
        prev.map((m) =>
          m._id === meetingId
            ? { ...m, applicationId: { ...m.applicationId, status: "Hired" } }
            : m
        )
      );
      toast.success("Freelancer hired successfully!");
    } catch (err) {
      console.error("Error confirming hire:", err);
      toast.error("Failed to confirm hire.");
    }
  };

  const hasDropdownOptions = (meeting) => {
    return (
      meeting.status === "Scheduled" ||
      meeting.status === "Completed" ||
      meeting.status === "Failed"
    );
  };

  const MeetingCard = ({ meeting }) => {
    const otherUser = getOtherUser(meeting);
    const jobTitle = meeting.applicationId?.jobId?.title || "N/A";
    const isPastMeeting = new Date(meeting.scheduledTime) < now;

    return (
      <div className="bg-white rounded-xl shadow p-5 border flex flex-col space-y-2 relative">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[#1A2E46]">{jobTitle}</h2>
          <span
            className={`text-sm px-3 py-1 rounded-full ${
              meeting.status === "Scheduled"
                ? "bg-green-100 text-green-700"
                : meeting.status === "Completed"
                ? "bg-blue-100 text-blue-700"
                : meeting.status === "Failed"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {meeting.status}
          </span>
        </div>
        <p>
          <span className="font-semibold">Scheduled:</span>{" "}
          {format(new Date(meeting.scheduledTime), "PPPpp", {
            timeZone: "Asia/Kathmandu",
          })}
        </p>

        {user.role === "hirer" ? (
          <div>
            <span className="font-semibold">Freelancer:</span>{" "}
            {meeting.applicationId.userId?.firstName ?? "N/A"}{" "}
            {meeting.applicationId.userId?.lastName ?? ""} (
            {meeting.applicationId.userId?.email ?? "N/A"})
          </div>
        ) : (
          <div>
            <span className="font-semibold">Hirer:</span>{" "}
            {meeting.applicationId.jobId?.hirer?.firstName ?? "N/A"}{" "}
            {meeting.applicationId.jobId?.hirer?.lastName ?? ""} (
            {meeting.applicationId.jobId?.hirer?.email ?? "N/A"})
          </div>
        )}

        <div className="flex justify-between items-center">
          <a
            href={meeting.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#58A6FF] text-white px-4 py-2 rounded-md hover:bg-[#1A2E46] transition"
          >
            Join Meeting
          </a>

          <div className="flex items-center space-x-3">
            {user.role === "hirer" &&
              isPastMeeting &&
              meeting.status === "Completed" &&
              meeting.applicationId.status !== "Hired" && (
                <button
                  onClick={() =>
                    handleConfirmHire(meeting.applicationId._id, meeting._id)
                  }
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                >
                  Confirm Hire
                </button>
              )}

            {(user._id === meeting.createdBy?._id ||
              user._id === meeting.createdBy) &&
              hasDropdownOptions(meeting) && (
                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === meeting._id ? null : meeting._id
                      )
                    }
                    className="p-2 text-gray-600 hover:text-black"
                  >
                    <FiMoreVertical size={20} />
                  </button>
                  {activeDropdown === meeting._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-lg z-50">
                      {meeting.status === "Scheduled" && (
                        <>
                          <button
                            onClick={() => {
                              setRescheduleModal(meeting);
                              setNewSchedule(
                                new Date(meeting.scheduledTime)
                                  .toISOString()
                                  .slice(0, 16)
                              );
                              setActiveDropdown(null);
                            }}
                            className="flex items-center w-full text-left px-4 py-3 text-gray-900 hover:bg-gray-200 rounded-t-lg"
                          >
                            <FiEdit className="mr-2" size={16} />
                            Reschedule
                          </button>
                          <div className="border-t border-gray-200"></div>
                          <button
                            onClick={() => {
                              setShowCancelConfirm(meeting);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-gray-200"
                          >
                            <FiXCircle className="mr-2" size={16} />
                            Cancel
                          </button>
                          <div className="border-t border-gray-200"></div>
                          <button
                            onClick={() => {
                              handleUpdateStatus(meeting._id, "Completed");
                              setActiveDropdown(null);
                            }}
                            className="flex items-center w-full text-left px-4 py-3 text-blue-600 hover:bg-gray-200"
                          >
                            <FiCheckCircle className="mr-2" size={16} />
                            Mark as Completed
                          </button>
                          <div className="border-t border-gray-200"></div>
                          <button
                            onClick={() => {
                              handleUpdateStatus(meeting._id, "Failed");
                              setActiveDropdown(null);
                            }}
                            className="flex items-center w-full text-left px-4 py-3 text-yellow-600 hover:bg-gray-200 rounded-b-lg"
                          >
                            <FiAlertTriangle className="mr-2" size={16} />
                            Mark as Failed
                          </button>
                        </>
                      )}
                      {meeting.status === "Completed" && (
                        <button
                          onClick={() => {
                            handleUpdateStatus(meeting._id, "Failed");
                            setActiveDropdown(null);
                          }}
                          className="flex items-center w-full text-left px-4 py-3 text-yellow-600 hover:bg-gray-200 rounded-lg"
                        >
                          <FiAlertTriangle className="mr-2" size={16} />
                          Mark as Failed
                        </button>
                      )}
                      {meeting.status === "Failed" && (
                        <button
                          onClick={() => {
                            handleUpdateStatus(meeting._id, "Completed");
                            setActiveDropdown(null);
                          }}
                          className="flex items-center w-full text-left px-4 py-3 text-blue-600 hover:bg-gray-200 rounded-lg"
                        >
                          <FiCheckCircle className="mr-2" size={16} />
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

        {rescheduleModal && rescheduleModal._id === meeting._id && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4 text-[#1A2E46]">
                Reschedule Meeting
              </h2>
              <input
                type="datetime-local"
                className="w-full border p-2 rounded mb-4"
                value={newSchedule}
                onChange={(e) => setNewSchedule(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRescheduleModal(null)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReschedule}
                  className="bg-[#58A6FF] hover:bg-[#1A2E46] text-white px-4 py-2 rounded-md transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Scheduled Meetings</h1>
      {loading ? (
        <p>Loading meetings...</p>
      ) : meetings.length === 0 ? (
        <p>No meetings scheduled yet.</p>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-3">Upcoming Meetings</h2>
          <div className="grid gap-6 mb-8">
            {upcoming.length > 0 ? (
              upcoming.map((meeting) => (
                <MeetingCard key={meeting._id} meeting={meeting} />
              ))
            ) : (
              <p className="text-gray-500">No upcoming meetings.</p>
            )}
          </div>

          <h2 className="text-xl font-semibold mb-3">Past Meetings</h2>
          <div className="grid gap-6">
            {past.length > 0 ? (
              past.map((meeting) => (
                <MeetingCard key={meeting._id} meeting={meeting} />
              ))
            ) : (
              <p className="text-gray-500">No past meetings.</p>
            )}
          </div>
        </>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Cancel Meeting</h2>
            <p className="mb-4">
              Are you sure you want to cancel this meeting?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Reason for Cancellation:
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full border p-2 rounded mt-1"
                rows="3"
                placeholder="Please provide a reason for cancelling the meeting..."
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCancelConfirm(null);
                  setCancelReason("");
                }}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                No
              </button>
              <button
                onClick={() => {
                  handleCancelMeeting(showCancelConfirm._id);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {rescheduling && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-lg font-medium text-gray-800 mb-4">
              Rescheduling...
            </p>
            <div className="h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledMeetings;
