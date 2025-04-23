import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { UserData } from "../context/UserContext";

const TaskBoard = () => {
  const { id } = useParams();
  const { user } = UserData();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
    files: [],
  });
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/projects/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProject(response.data);
        setLoading(false);
      } catch (error) {
        console.error(
          "Error fetching project:",
          error.response?.data || error.message
        );
        setError(error.response?.data?.message || "Failed to fetch project.");
        setLoading(false);
        toast.error(
          `Failed to fetch project: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    };

    if (user) {
      fetchProject();
    }
  }, [id, user]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", newTask.title);
      formData.append("description", newTask.description);
      formData.append("deadline", newTask.deadline);
      newTask.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await axios.post(
        `http://localhost:5000/api/projects/${id}/tasks`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setProject((prev) => ({
        ...prev,
        tasks: [...prev.tasks, response.data.task],
      }));
      setNewTask({ title: "", description: "", deadline: "", files: [] });
      setShowAddTaskModal(false);
      toast.success("Task added successfully!");
    } catch (error) {
      console.error(
        "Error adding task:",
        error.response?.data || error.message
      );
      toast.error("Failed to add task.");
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination } = result;

    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const draggedTask = sourceColumn[source.index];
    const newStatus = destination.droppableId;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/projects/${id}/tasks/${draggedTask._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedTasks = [...project.tasks];
      const taskIndex = updatedTasks.findIndex(
        (t) => t._id === draggedTask._id
      );
      updatedTasks.splice(taskIndex, 1);
      const newTask = { ...draggedTask, status: newStatus };
      const destinationTasks = columns[destination.droppableId];
      const destinationIndex = destination.index;
      let insertIndex;
      if (destinationTasks.length === 0) {
        insertIndex = updatedTasks.length;
      } else {
        const taskAtDestination =
          destinationTasks[destinationIndex] ||
          destinationTasks[destinationIndex - 1];
        insertIndex = updatedTasks.findIndex(
          (t) => t._id === taskAtDestination._id
        );
        if (destinationIndex === destinationTasks.length) {
          insertIndex += 1;
        }
      }
      updatedTasks.splice(insertIndex, 0, newTask);

      setProject((prev) => ({ ...prev, tasks: updatedTasks }));
      toast.success("Task status updated!");
    } catch (error) {
      console.error(
        "Error updating task status:",
        error.response?.data || error.message
      );
      toast.error("Failed to update task status.");
    }
  };

  const handleMarkAsCompleted = () => {
    navigate(`/projects/${id}/payment`, {
      state: { from: `/projects/${id}/task-board` },
    });
  };

  const columns = useMemo(() => {
    return {
      "To-Do": project?.tasks?.filter((task) => task.status === "To-Do") || [],
      "In-Progress":
        project?.tasks?.filter((task) => task.status === "In-Progress") || [],
      Done: project?.tasks?.filter((task) => task.status === "Done") || [],
    };
  }, [project?.tasks]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setNewTask((prev) => ({ ...prev, files: selectedFiles }));
  };

  const openTaskDetailModal = (task) => {
    setSelectedTask(task);
    setShowTaskDetailModal(true);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-600 mb-4">{error || "Project not found."}</p>
        <button
          onClick={() =>
            navigate(
              user.role === "hirer"
                ? `/hirer/${user._id}/projects`
                : `/user/${user._id}/projects`
            )
          }
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <nav className="mb-4 text-sm text-gray-600">
        <ol className="list-none p-0 inline-flex">
          <li className="flex items-center">
            <Link
              to={`/hirer/${user._id}/projects`}
              className="text-[#1A2E46] hover:text-[#58A6FF]"
            >
              Projects
            </Link>
            <span className="mxPZ-2">/</span>
          </li>
          <li className="flex items-center">
            <Link
              to={`/projects/${id}`}
              className="text-[#1A2E46] hover:text-[#58A6FF]"
            >
              {project.title}
            </Link>
            <span className="mx-2">/</span>
          </li>
          <li className="flex items-center">
            <span className="text-gray-500">Task Board</span>
          </li>
        </ol>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#1A2E46]">
          Task Board for {project.title}
        </h1>
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
        >
          Back to Project Details
        </button>
      </div>

      <div className="mb-6 text-gray-500 text-sm">
        <p>
          <span className="font-medium">Duration:</span>{" "}
          {project.duration ? `${project.duration} days` : "Not specified"}
        </p>
        <p>
          <span className="font-medium">Deadline:</span>{" "}
          {project.deadline
            ? format(new Date(project.deadline), "PPP")
            : "Not specified"}
        </p>
      </div>
      {user.role === "hirer" && (
        <button
          onClick={() => setShowAddTaskModal(true)}
          className="bg-[#D6E4FF] text-[#3366CC] px-4 py-2 rounded-md hover:bg-[#B3C7FF] transition mb-6 font-medium"
        >
          Add Task
        </button>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["To-Do", "In-Progress", "Done"].map((column) => (
            <div key={column} className="bg-white rounded-lg p-4">
              <div className="flex items-center mb-4">
                <h2
                  className={`text-lg font-medium border-b-2 pb-1 ${
                    column === "To-Do"
                      ? "border-purple-500 text-gray-800"
                      : column === "In-Progress"
                      ? "border-yellow-500 text-gray-800"
                      : "border-green-500 text-gray-800"
                  }`}
                >
                  {column}
                </h2>
                <span
                  className={`ml-2 text-xs font-semibold px-2 py-1 rounded-full ${
                    column === "To-Do"
                      ? "bg-purple-100 text-purple-600"
                      : column === "In-Progress"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {columns[column].length}
                </span>
              </div>
              <Droppable droppableId={column}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-[200px]"
                  >
                    {columns[column].map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={String(task._id)}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-3 mb-3 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition"
                            onClick={() => openTaskDetailModal(task)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-800">
                                  {task.title}
                                </h3>
                                <p className="text-xs text-gray-500 truncate">
                                  {task.description || "No description"}
                                </p>
                              </div>
                              <div className="flex items-center text-gray-400 text-xs">
                                <span className="mr-1">📎</span>
                                <span>
                                  {task.files ? task.files.length : 0} files
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {user.role === "hirer" && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleMarkAsCompleted}
            disabled={project.status === "Completed"}
            className={`px-4 py-2 rounded-md text-white font-medium transition ${
              project.status === "Completed"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {project.status === "Completed"
              ? "Project Completed"
              : "Mark as Completed"}
          </button>
        </div>
      )}

      {user.role === "hirer" && showAddTaskModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Add New Task
            </h2>
            <form onSubmit={handleAddTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Task Title
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-[#D6E4FF]"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-[#D6E4FF]"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  placeholder="Enter task description"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-[#D6E4FF]"
                  value={newTask.deadline}
                  onChange={(e) =>
                    setNewTask({ ...newTask, deadline: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Attach Files (Optional)
                </label>
                <input
                  type="file"
                  multiple
                  className="w-full border border-gray-300 p-2 rounded mt-1"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                />
                {newTask.files.length > 0 && (
                  <ul className="mt-2 list-disc pl-4 text-sm text-gray-600">
                    {newTask.files.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTaskModal(false);
                    setNewTask({
                      title: "",
                      description: "",
                      deadline: "",
                      files: [],
                    });
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#D6E4FF] text-[#3366CC] px-4 py-2 rounded hover:bg-[#B3C7FF] transition"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTaskDetailModal && selectedTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Task Details
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Task Title
              </label>
              <p className="text-gray-800">{selectedTask.title}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <p className="text-gray-600">
                {selectedTask.description || "No description"}
              </p>
            </div>
            {selectedTask.deadline && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Deadline
                </label>
                <p className="text-gray-600">
                  {format(new Date(selectedTask.deadline), "PPP")}
                </p>
              </div>
            )}
            {selectedTask.files && selectedTask.files.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Attached Files
                </label>
                <ul className="list-disc pl-4">
                  {selectedTask.files.map((file, index) => (
                    <li key={index}>
                      <a
                        href={`http://localhost:5000${file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {file.split("/").pop()}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setShowTaskDetailModal(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
