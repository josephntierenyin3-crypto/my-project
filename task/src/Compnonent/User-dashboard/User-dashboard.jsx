import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { TaskContext } from "../../context/TaskContext";
import { TaskStatusChart, BookingStatusChart, TaskPriorityChart, RevenueChart } from "../../components/Charts/StatisticsCharts";
import "../../components/Charts/StatisticsCharts.css";
import "./User-dashboard.css";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { 
    tasks, 
    submissions, 
    addTask, 
    updateTask, 
    deleteTask, 
    addSubmission,
    getTaskCounts,
    getSubmissionCounts 
  } = useContext(TaskContext);

  const [formData, setFormData] = useState({
    passengerName: "",
    busNumber: "",
    carReg: "",
    etaMinutes: "",
    passengers: "",
    amount: "",
    taskId: null, // Link to task if booking online
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  const [editingTask, setEditingTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings");

  const taskCounts = getTaskCounts();
  const submissionCounts = getSubmissionCounts();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTaskFormChange = (e) => {
    setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (Object.values(formData).some((v) => v === "" && v !== null)) {
      alert("Please fill all required fields");
      return;
    }

    const newSubmission = {
      id: Date.now(),
      ...formData,
      passengers: Number(formData.passengers),
      amount: Number(formData.amount),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    addSubmission(newSubmission);

    // If booking online (has taskId), the task will be marked as done automatically in TaskContext
    if (formData.taskId) {
      updateTask(formData.taskId, { status: 'completed' });
    }

    setFormData({
      passengerName: "",
      busNumber: "",
      carReg: "",
      etaMinutes: "",
      passengers: "",
      amount: "",
      taskId: null,
    });
    
    alert("Booking submitted successfully! Task marked as done.");
  };

  const handleTaskSubmit = () => {
    if (!taskForm.title) {
      alert("Please enter a task title");
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, taskForm);
      setEditingTask(null);
    } else {
      addTask(taskForm);
    }

    setTaskForm({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
    });
    setShowTaskForm(false);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority || "medium",
      dueDate: task.dueDate || "",
    });
    setShowTaskForm(true);
  };

  const handleDeleteTask = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask(id);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleBookingWithTask = (taskId) => {
    setFormData({ ...formData, taskId });
    setActiveTab("bookings");
  };

  return (
    <div className="user-dashboard-container">
      <div className="dashboard-header">
        <h1>User Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || user?.email}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Auto Counting Stats */}
      <div className="stats-section">
        <div className="stat-card">
          <h3>Tasks</h3>
          <div className="stat-numbers">
            <div>
              <span className="stat-label">Total:</span>
              <span className="stat-value">{taskCounts.total}</span>
            </div>
            <div>
              <span className="stat-label">Pending:</span>
              <span className="stat-value pending">{taskCounts.pending}</span>
            </div>
            <div>
              <span className="stat-label">Completed:</span>
              <span className="stat-value completed">{taskCounts.completed}</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <h3>Bookings</h3>
          <div className="stat-numbers">
            <div>
              <span className="stat-label">Total:</span>
              <span className="stat-value">{submissionCounts.total}</span>
            </div>
            <div>
              <span className="stat-label">Pending:</span>
              <span className="stat-value pending">{submissionCounts.pending}</span>
            </div>
            <div>
              <span className="stat-label">Approved:</span>
              <span className="stat-value completed">{submissionCounts.approved}</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <h3>Revenue</h3>
          <div className="stat-numbers">
            <div className="stat-large">
              <span className="stat-value revenue">₵ {submissionCounts.totalRevenue.toFixed(2)}</span>
            </div>
            <div>
              <span className="stat-label">Passengers:</span>
              <span className="stat-value">{submissionCounts.totalPassengers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "bookings" ? "active-tab" : ""}
          onClick={() => setActiveTab("bookings")}
        >
          Bookings
        </button>
        <button
          className={activeTab === "tasks" ? "active-tab" : ""}
          onClick={() => setActiveTab("tasks")}
        >
          Tasks
        </button>
        <button
          className={activeTab === "charts" ? "active-tab" : ""}
          onClick={() => setActiveTab("charts")}
        >
          Statistics & Charts
        </button>
      </div>

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="grid-container">
          <div className="grid-item form-section">
            <h3>Submit Booking</h3>
            <p className="info-text">
              Note: When booking online, select a task to automatically mark it as done.
            </p>

            <input
              name="passengerName"
              placeholder="Passenger Name"
              value={formData.passengerName}
              onChange={handleChange}
            />
            <input
              name="busNumber"
              placeholder="Bus Number"
              value={formData.busNumber}
              onChange={handleChange}
            />
            <input
              name="carReg"
              placeholder="Car Registration"
              value={formData.carReg}
              onChange={handleChange}
            />
            <input
              type="number"
              name="etaMinutes"
              placeholder="ETA (minutes)"
              value={formData.etaMinutes}
              onChange={handleChange}
            />
            <input
              type="number"
              name="passengers"
              placeholder="Passengers"
              value={formData.passengers}
              onChange={handleChange}
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount Collected"
              value={formData.amount}
              onChange={handleChange}
            />

            {/* Link to Task */}
            <div className="task-link-section">
              <label>Link to Task (Optional - marks task as done when booking):</label>
              <select
                name="taskId"
                value={formData.taskId || ""}
                onChange={(e) => setFormData({ ...formData, taskId: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">No task linked</option>
                {tasks.filter(t => t.status === 'pending').map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title} (Pending)
                  </option>
                ))}
              </select>
            </div>

            <button onClick={handleSubmit}>Submit Booking</button>
          </div>

          <div className="grid-item table-section">
            <h3>Submitted Bookings</h3>
            <table className="fleet-table">
              <thead>
                <tr>
                  <th>Passenger</th>
                  <th>Bus</th>
                  <th>Car Reg</th>
                  <th>ETA</th>
                  <th>Pax</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      No submissions yet
                    </td>
                  </tr>
                )}
                {submissions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.passengerName}</td>
                    <td>{s.busNumber}</td>
                    <td>{s.carReg}</td>
                    <td>{s.etaMinutes} min</td>
                    <td>{s.passengers}</td>
                    <td>₵ {s.amount.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${s.status.toLowerCase()}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div className="tasks-section">
          <div className="tasks-header">
            <h3>Task Management</h3>
            <button 
              className="add-task-btn"
              onClick={() => {
                setShowTaskForm(true);
                setEditingTask(null);
                setTaskForm({
                  title: "",
                  description: "",
                  priority: "medium",
                  dueDate: "",
                });
              }}
            >
              + Add New Task
            </button>
          </div>

          {showTaskForm && (
            <div className="task-form-modal">
              <div className="task-form-content">
                <h3>{editingTask ? "Edit Task" : "Create New Task"}</h3>
                <input
                  name="title"
                  placeholder="Task Title *"
                  value={taskForm.title}
                  onChange={handleTaskFormChange}
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={taskForm.description}
                  onChange={handleTaskFormChange}
                  rows="3"
                />
                <select
                  name="priority"
                  value={taskForm.priority}
                  onChange={handleTaskFormChange}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <input
                  type="date"
                  name="dueDate"
                  value={taskForm.dueDate}
                  onChange={handleTaskFormChange}
                />
                <div className="task-form-actions">
                  <button onClick={handleTaskSubmit}>
                    {editingTask ? "Update Task" : "Save Task"}
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setShowTaskForm(false);
                      setEditingTask(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="tasks-list">
            {tasks.length === 0 ? (
              <p className="no-tasks">No tasks yet. Create your first task!</p>
            ) : (
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.title}</td>
                      <td>{task.description || "-"}</td>
                      <td>
                        <span className={`priority-badge ${task.priority}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>{task.dueDate || "-"}</td>
                      <td>
                        <span className={`status-badge ${task.status}`}>
                          {task.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => handleEditTask(task)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Delete
                          </button>
                          {task.status !== 'completed' && (
                            <button
                              className="complete-btn"
                              onClick={() => updateTask(task.id, { status: 'completed' })}
                            >
                              Done
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Charts Tab */}
      {activeTab === "charts" && (
        <div className="charts-section">
          <h3>Statistics & Analytics</h3>
          <div className="charts-grid">
            <TaskStatusChart tasks={tasks} />
            <BookingStatusChart submissions={submissions} />
            <TaskPriorityChart tasks={tasks} />
            <RevenueChart submissions={submissions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
