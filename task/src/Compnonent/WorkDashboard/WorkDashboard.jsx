import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { WorkContext } from "../../context/WorkContext";
import { TaskContext } from "../../context/TaskContext";
import { api } from "../../api/client";
import "./WorkDashboard.css";

const KANBAN_COLUMNS = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

const SIDEBAR_GROUPS = [
  {
    label: "Book",
    items: [{ id: "booking", label: "Book a Trip" }],
  },
  {
    label: "Fleet (from Admin)",
    items: [
      { id: "bus", label: "Registered Buses" },
      { id: "driver", label: "Registered Drivers" },
      { id: "trips", label: "Trips (Bus + Driver + Time)" },
    ],
  },
  {
    label: "Work & Tasks",
    items: [
      { id: "work", label: "Work" },
      { id: "admintasks", label: "Admin Tasks" },
      { id: "addtask", label: "Add Task" },
    ],
  },
  {
    label: "Settings",
    items: [{ id: "settings", label: "Booking Settings" }],
  },
];

const WorkDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { tasks: localTasks, updateTask: updateLocalTask } = useContext(TaskContext);
  const {
    workspaces,
    projects,
    tasks,
    loading,
    error,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    selectedProjectId,
    setSelectedProjectId,
    fetchWorkspaces,
    fetchProjects,
    fetchTasks,
    addWorkspace,
    addProject,
    addTask,
    updateTask,
    deleteTask,
    deleteWorkspace,
    deleteProject,
  } = useContext(WorkContext);

  const [activeSection, setActiveSection] = useState("booking");
  const [viewMode, setViewMode] = useState("list");
  const [myWorkMode, setMyWorkMode] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [userBookingsLoading, setUserBookingsLoading] = useState(false);
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [workspaceForm, setWorkspaceForm] = useState({ name: "", description: "" });
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    status: "todo",
  });
  const [bookingForm, setBookingForm] = useState({
    tripId: null,
    destination: "",
    start_journey: "",
    passengerName: "",
    busNumber: "",
    carReg: "",
    etaMinutes: "",
    passengers: "",
    amount: "",
    taskId: null,
  });
  const [userBuses, setUserBuses] = useState([]);
  const [userDrivers, setUserDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [adminTasks, setAdminTasks] = useState([]);
  const [tripForm, setTripForm] = useState({
    bus_id: "",
    driver_id: "",
    scheduled_at: "",
    expected_arrival_at: "",
  });
  const [bookingSettings, setBookingSettings] = useState({ currency: "₵", default_capacity: "" });

  /** Load registered buses and drivers from admin (same data admin sees). Refetch when user opens Booking, Trips, or Fleet. */
  const fetchBusesAndDrivers = () => {
    Promise.all([
      api.buses().catch(() => []),
      api.drivers().catch(() => []),
      api.bookingSettings().catch(() => ({})),
    ]).then(([buses, drivers, settings]) => {
      setUserBuses(Array.isArray(buses) ? buses : []);
      setUserDrivers(Array.isArray(drivers) ? drivers : []);
      if (settings && typeof settings === "object") {
        setBookingSettings({
          currency: settings.currency ?? "₵",
          default_capacity: settings.default_capacity ?? "",
          price_per_seat: settings.price_per_seat ?? "",
        });
      }
    });
  };

  useEffect(() => {
    fetchBusesAndDrivers();
  }, []);

  useEffect(() => {
    if (["booking", "trips", "bus", "driver"].includes(activeSection)) {
      fetchBusesAndDrivers();
    }
  }, [activeSection]);

  useEffect(() => {
    if (user?.id) fetchWorkspaces(user.id);
  }, [user?.id, fetchWorkspaces]);

  useEffect(() => {
    if (selectedWorkspaceId) fetchProjects(selectedWorkspaceId);
    else setSelectedProjectId(null);
  }, [selectedWorkspaceId, fetchProjects, setSelectedProjectId]);

  useEffect(() => {
    if (myWorkMode && user?.id) {
      fetchTasks(null, null, user.id);
      return;
    }
    if (selectedProjectId) fetchTasks(selectedProjectId, null, null);
    else if (selectedWorkspaceId) fetchTasks(null, selectedWorkspaceId, null);
    else fetchTasks(null, null, null);
  }, [myWorkMode, selectedProjectId, selectedWorkspaceId, user?.id, fetchTasks]);

  const fetchUserBookings = () => {
    if (!user?.id) return;
    setUserBookingsLoading(true);
    api.bookings.list(user.id).then((list) => {
      setUserBookings(Array.isArray(list) ? list : []);
    }).catch(() => setUserBookings([])).finally(() => setUserBookingsLoading(false));
  };
  useEffect(() => {
    if (activeSection === "booking" && user?.id) fetchUserBookings();
  }, [activeSection, user?.id]);

  useEffect(() => {
    if (activeSection === "trips" || activeSection === "booking") {
      api.trips.list().then((list) => setTrips(Array.isArray(list) ? list : [])).catch(() => setTrips([]));
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "admintasks") api.adminTasks.list().then((list) => setAdminTasks(Array.isArray(list) ? list : [])).catch(() => setAdminTasks([]));
  }, [activeSection]);

  const handleAddWorkspace = async (e) => {
    e.preventDefault();
    if (!workspaceForm.name.trim()) return;
    try {
      await addWorkspace(user.id, workspaceForm.name.trim(), workspaceForm.description.trim());
      setWorkspaceForm({ name: "", description: "" });
      setShowWorkspaceForm(false);
    } catch (err) {
      alert(err.message || "Failed to add workspace");
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!projectForm.name.trim() || !selectedWorkspaceId) return;
    try {
      await addProject(selectedWorkspaceId, projectForm.name.trim(), projectForm.description.trim());
      setProjectForm({ name: "", description: "" });
      setShowProjectForm(false);
    } catch (err) {
      alert(err.message || "Failed to add project");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !selectedProjectId) {
      alert("Select a project and enter a task title.");
      return;
    }
    try {
      await addTask(selectedProjectId, {
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || null,
        status: taskForm.status,
        assigneeId: user?.id || null,
      });
      setTaskForm({ title: "", description: "", priority: "medium", dueDate: "", status: "todo" });
      setShowTaskForm(false);
    } catch (err) {
      alert(err.message || "Failed to add task");
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editingTask || !taskForm.title.trim()) return;
    try {
      await updateTask(editingTask.id, {
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || null,
        status: taskForm.status,
      });
      setEditingTask(null);
      setTaskForm({ title: "", description: "", priority: "medium", dueDate: "", status: "todo" });
      setShowTaskForm(false);
    } catch (err) {
      alert(err.message || "Failed to update task");
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (err) {
      alert(err.message || "Failed to update task");
    }
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority || "medium",
      dueDate: task.due_date ? task.due_date.slice(0, 10) : "",
      status: task.status || "todo",
    });
    setShowTaskForm(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    if (name === "tripId") {
      const trip = trips.find((t) => String(t.id) === value);
      setBookingForm((prev) => ({
        ...prev,
        tripId: value ? Number(value) : null,
        busNumber: trip ? trip.bus_number : prev.busNumber,
      }));
      return;
    }
    setBookingForm((prev) => ({
      ...prev,
      [name]: name === "taskId" ? (value ? Number(value) : null) : value,
    }));
  };

  const openTrips = (trips || []).filter((t) => (t.status || "") !== "reached" && (t.status || "") !== "completed");

  const handleTripSubmit = async (e) => {
    e.preventDefault();
    if (!tripForm.bus_id || !tripForm.driver_id || !tripForm.scheduled_at || !tripForm.expected_arrival_at) {
      alert("Fill bus, driver, scheduled time and expected arrival.");
      return;
    }
    try {
      await api.trips.create({
        bus_id: Number(tripForm.bus_id),
        driver_id: Number(tripForm.driver_id),
        scheduled_at: tripForm.scheduled_at,
        expected_arrival_at: tripForm.expected_arrival_at,
      });
      setTripForm({ bus_id: "", driver_id: "", scheduled_at: "", expected_arrival_at: "" });
      const list = await api.trips.list();
      setTrips(Array.isArray(list) ? list : []);
      alert("Trip created. Users can now add bookings until you mark it as Reached.");
    } catch (err) {
      alert(err.message || "Failed to create trip");
    }
  };

  const handleMarkTripReached = async (tripId) => {
    if (!window.confirm("Mark this trip as Reached? No more bookings will be accepted.")) return;
    try {
      await api.trips.update(tripId, { status: "reached" });
      setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status: "reached" } : t)));
    } catch (err) {
      alert(err.message || "Failed to update trip");
    }
  };

  const handleAdminTaskStatusChange = async (taskId, status) => {
    try {
      await api.adminTasks.updateStatus(taskId, status);
      setAdminTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    } catch (err) {
      alert(err.message || "Failed to update task");
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.passengerName || !bookingForm.busNumber) {
      alert("Passenger name and bus/trip are required.");
      return;
    }
    if (!user?.id) {
      alert("You must be logged in to submit a booking.");
      return;
    }
    try {
      await api.bookings.create({
        userId: user.id,
        tripId: bookingForm.tripId || null,
        destination: bookingForm.destination || null,
        start_journey: bookingForm.start_journey || null,
        passengerName: bookingForm.passengerName,
        busNumber: bookingForm.busNumber,
        carReg: bookingForm.carReg || "",
        etaMinutes: Number(bookingForm.etaMinutes) || 0,
        passengers: Number(bookingForm.passengers) || 0,
        amount: Number(bookingForm.amount) || 0,
        taskId: bookingForm.taskId || null,
      });
      if (bookingForm.taskId) {
        updateLocalTask(bookingForm.taskId, { status: "completed" });
        try {
          await updateTask(bookingForm.taskId, { status: "done" });
        } catch (_) {}
      }
      setBookingForm({
        tripId: null,
        destination: "",
        start_journey: "",
        passengerName: "",
        busNumber: "",
        carReg: "",
        etaMinutes: "",
        passengers: "",
        amount: "",
        taskId: null,
      });
      fetchUserBookings();
      alert("Booking submitted successfully! Admin can approve it.");
    } catch (err) {
      alert(err.message || "Failed to submit booking");
    }
  };

  const displayTasks = myWorkMode ? tasks : tasks;
  const tasksByStatus = (status) => displayTasks.filter((t) => (t.status || "todo") === status);

  return (
    <div className="work-dashboard">
      <header className="work-header">
        <div className="work-header-left">
          <h1 className="work-logo">GoodDay</h1>
          <span className="work-user">Hi, {user?.name || user?.email}</span>
        </div>
        <div className="work-header-right">
          <button type="button" className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="work-body user-with-sidebar">
        <aside className="work-sidebar user-nav-sidebar">
          <nav className="user-nav">
            {SIDEBAR_GROUPS.map((group) => (
              <div key={group.label} className="user-nav-group">
                <span className="user-nav-group-label">{group.label}</span>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`user-nav-item ${activeSection === item.id ? "active" : ""}`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <main className="work-main">
          <div className="user-overview-strip">
            <span className="user-overview-item">Buses: <strong>{userBuses.length}</strong></span>
            <span className="user-overview-item">Drivers: <strong>{userDrivers.length}</strong></span>
            <span className="user-overview-item">Currency: <strong>{/\d/.test(bookingSettings.currency) ? "₵" : (bookingSettings.currency || "₵")}</strong></span>
          </div>

          {activeSection === "booking" && (
            <div className="bookings-section">
              <div className="booking-fleet-summary">
                <h3 className="booking-page-title">Book a Trip</h3>
                <p className="booking-page-desc">Use registered buses and drivers from admin. Select a scheduled trip or choose a bus manually.</p>
                <div className="fleet-cards">
                  <div className="fleet-card">
                    <span className="fleet-card-value">{userBuses.length}</span>
                    <span className="fleet-card-label">Registered Buses</span>
                  </div>
                  <div className="fleet-card">
                    <span className="fleet-card-value">{userDrivers.length}</span>
                    <span className="fleet-card-label">Registered Drivers</span>
                  </div>
                  <div className="fleet-card">
                    <span className="fleet-card-value">{openTrips.length}</span>
                    <span className="fleet-card-label">Open Trips</span>
                  </div>
                </div>
              </div>
              <div className="bookings-section grid-container">
              <div className="grid-item form-section">
                <h3>Submit Booking</h3>
                <p className="info-text">
                  {userBuses.length > 0 ? "Select from registered buses or an open trip. " : ""}
                  When booking online, you can link a task to mark it as done.
                </p>
                <form className="booking-form-structured" onSubmit={handleBookingSubmit}>
                  <section className="booking-section journey-section">
                    <h4>Journey</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Start journey</label>
                        <input
                          name="start_journey"
                          placeholder="e.g. Accra Station"
                          value={bookingForm.start_journey}
                          onChange={handleBookingChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Destination</label>
                        <input
                          name="destination"
                          placeholder="e.g. Kumasi"
                          value={bookingForm.destination}
                          onChange={handleBookingChange}
                        />
                      </div>
                    </div>
                  </section>

                  <section className="booking-section trip-section">
                    <h4>Trip (Bus + Driver + Time)</h4>
                    <p className="section-hint">Each bus has 30 seats. Price in cedis (₵). When trip is reached, no more bookings.</p>
                    {openTrips.length > 0 ? (
                      <div className="form-group">
                        <label>Select trip</label>
                        <select
                          name="tripId"
                          value={bookingForm.tripId || ""}
                          onChange={handleBookingChange}
                        >
                          <option value="">No trip (enter bus manually)</option>
                          {openTrips.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.bus_number} / {t.driver_name} — {t.scheduled_at ? new Date(t.scheduled_at).toLocaleString() : ""} — Available: {t.available_seats ?? (Number(t.max_capacity || 30) - Number(t.booking_count || 0))} seats — {bookingSettings.currency || "₵"}{bookingSettings.price_per_seat ? Number(bookingSettings.price_per_seat) : "—"} per seat
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <p className="fleet-hint">No open trips. Create one under Trips, or select bus manually below.</p>
                    )}
                    {userBuses.length > 0 && !bookingForm.tripId ? (
                      <div className="form-group">
                        <label>Bus (30 seats)</label>
                        <select
                          name="busNumber"
                          value={bookingForm.busNumber}
                          onChange={handleBookingChange}
                          required={!bookingForm.tripId}
                        >
                          <option value="">Select bus</option>
                          {userBuses.map((b) => (
                            <option key={b.id} value={b.bus_number}>
                              {b.bus_number} {b.plate_no ? `(${b.plate_no})` : ""} — {b.capacity || 30} seats
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : bookingForm.tripId ? null : (
                      <div className="form-group">
                        <label>Bus number</label>
                        <input
                          name="busNumber"
                          placeholder="Bus Number"
                          value={bookingForm.busNumber}
                          onChange={handleBookingChange}
                          required
                        />
                      </div>
                    )}
                  </section>

                  <section className="booking-section passenger-section">
                    <h4>Passenger & payment (cedis)</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Passenger name</label>
                        <input
                          name="passengerName"
                          placeholder="Passenger Name"
                          value={bookingForm.passengerName}
                          onChange={handleBookingChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Car reg.</label>
                        <input
                          name="carReg"
                          placeholder="Car Registration"
                          value={bookingForm.carReg}
                          onChange={handleBookingChange}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Passengers (count)</label>
                        <input
                          type="number"
                          name="passengers"
                          placeholder="1"
                          min="1"
                          value={bookingForm.passengers}
                          onChange={handleBookingChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>ETA (minutes)</label>
                        <input
                          type="number"
                          name="etaMinutes"
                          placeholder="0"
                          min="0"
                          value={bookingForm.etaMinutes}
                          onChange={handleBookingChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Amount ({bookingSettings.currency || "₵"} cedis)</label>
                        <input
                          type="number"
                          name="amount"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          value={bookingForm.amount}
                          onChange={handleBookingChange}
                        />
                      </div>
                    </div>
                  </section>

                  <section className="booking-section task-link-section">
                    <label>Link to Task (Optional – marks task as done when booking)</label>
                    <select
                      name="taskId"
                      value={bookingForm.taskId || ""}
                      onChange={handleBookingChange}
                    >
                      <option value="">No task linked</option>
                      {(tasks || []).filter((t) => (t.status || "todo") !== "done").map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({(t.status || "todo").replace("_", " ")})
                        </option>
                      ))}
                    </select>
                  </section>

                  <button type="submit" className="btn-submit-booking">Submit Booking</button>
                </form>
              </div>
              <div className="grid-item table-section">
                <h3>Submitted Bookings</h3>
                <table className="fleet-table">
                  <thead>
                    <tr>
                      <th>Start journey</th>
                      <th>Destination</th>
                      <th>Passenger</th>
                      <th>Bus</th>
                      <th>Car Reg</th>
                      <th>Pax</th>
                      <th>Amount (₵)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userBookingsLoading ? (
                      <tr><td colSpan={8} style={{ textAlign: "center" }}>Loading...</td></tr>
                    ) : userBookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center" }}>
                          No bookings yet. Submit one above.
                        </td>
                      </tr>
                    ) : (
                      userBookings.map((s) => (
                        <tr key={s.id}>
                          <td>{s.start_journey || "—"}</td>
                          <td>{s.destination || "—"}</td>
                          <td>{s.passenger_name}</td>
                          <td>{s.bus_number}</td>
                          <td>{s.car_reg || "—"}</td>
                          <td>{s.passengers ?? "—"}</td>
                          <td>{bookingSettings.currency || "₵"} {Number(s.amount).toFixed(2)}</td>
                          <td>
                            <span className={`status-badge ${(s.status || "pending").toLowerCase()}`}>
                              {s.status || "pending"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              </div>
            </div>
          )}

          {activeSection === "trips" && (
            <div className="user-section">
              <h3>Trips (Bus + Driver + Date/Time)</h3>
              <p className="section-desc">Create a trip using registered buses and drivers from admin. When it reaches, no more bookings are accepted. Auto-count: bookings vs capacity.</p>
              {userBuses.length === 0 || userDrivers.length === 0 ? (
                <div className="fleet-empty-message">
                  <p><strong>No buses or drivers yet.</strong> Ask admin to register buses and drivers in the Admin dashboard (Bus Registration, Driver Registration). They will appear here by name.</p>
                </div>
              ) : null}
              <form className="trip-form" onSubmit={handleTripSubmit}>
                <div className="form-group">
                  <label>Bus</label>
                  <select
                    value={tripForm.bus_id}
                    onChange={(e) => setTripForm({ ...tripForm, bus_id: e.target.value })}
                    required
                  >
                    <option value="">Select bus</option>
                    {userBuses.map((b) => (
                      <option key={b.id} value={b.id}>{b.bus_number}{b.plate_no ? ` (${b.plate_no})` : ""} — {b.capacity || 0} seats</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Driver</label>
                  <select
                    value={tripForm.driver_id}
                    onChange={(e) => setTripForm({ ...tripForm, driver_id: e.target.value })}
                    required
                  >
                    <option value="">Select driver</option>
                    {userDrivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}{d.license_no ? ` (${d.license_no})` : ""}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Scheduled at</label>
                  <input
                    type="datetime-local"
                    value={tripForm.scheduled_at}
                    onChange={(e) => setTripForm({ ...tripForm, scheduled_at: e.target.value })}
                    placeholder="mm/dd/yyyy --:-- --"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expected arrival</label>
                  <input
                    type="datetime-local"
                    value={tripForm.expected_arrival_at}
                    onChange={(e) => setTripForm({ ...tripForm, expected_arrival_at: e.target.value })}
                    placeholder="mm/dd/yyyy --:-- --"
                    required
                  />
                </div>
                <button type="submit">Create Trip</button>
              </form>
              <div className="table-section" style={{ marginTop: "1.5rem" }}>
                <h4>Trip list (Bookings / Capacity — Reached stops new bookings)</h4>
                <table className="fleet-table">
                  <thead>
                    <tr>
                      <th>Bus</th>
                      <th>Driver</th>
                      <th>Scheduled</th>
                      <th>Expected arrival</th>
                      <th>Bookings / Capacity</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.length === 0 ? (
                      <tr><td colSpan={7} style={{ textAlign: "center" }}>No trips yet. Create one above.</td></tr>
                    ) : (
                      trips.map((t) => (
                        <tr key={t.id}>
                          <td>{t.bus_number}</td>
                          <td>{t.driver_name || "—"}</td>
                          <td>{t.scheduled_at ? new Date(t.scheduled_at).toLocaleString() : "—"}</td>
                          <td>{t.expected_arrival_at ? new Date(t.expected_arrival_at).toLocaleString() : "—"}</td>
                          <td className="trip-capacity-cell"><strong>{t.booking_count ?? 0}</strong> / {t.max_capacity ?? 30} seats · Available: {t.available_seats ?? (Number(t.max_capacity || 30) - Number(t.booking_count || 0))} · {bookingSettings.currency || "₵"}{bookingSettings.price_per_seat || "—"} per seat</td>
                          <td><span className={`status-badge ${(t.status || "scheduled").toLowerCase()}`}>{t.status || "scheduled"}</span></td>
                          <td>
                            {(t.status || "scheduled") !== "reached" && (t.status || "") !== "completed" && (
                              <button type="button" className="btn-sm btn-reached" onClick={() => handleMarkTripReached(t.id)}>Mark Reached</button>
                            )}
                            {(t.status || "") === "reached" && <span className="reached-text">Reached</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === "admintasks" && (
            <div className="user-section">
              <h3>Admin Tasks</h3>
              <p className="section-desc">Tasks from admin. Update status when you fix them.</p>
              <table className="fleet-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminTasks.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center" }}>No admin tasks yet.</td></tr>
                  ) : (
                    adminTasks.map((t) => (
                      <tr key={t.id}>
                        <td>{t.title}</td>
                        <td>{(t.description || "—").slice(0, 60)}{(t.description && t.description.length > 60) ? "…" : ""}</td>
                        <td>{t.due_date ? t.due_date.slice(0, 10) : "—"}</td>
                        <td><span className={`status-badge ${(t.status || "pending").toLowerCase()}`}>{t.status || "pending"}</span></td>
                        <td>
                          <select
                            value={t.status || "pending"}
                            onChange={(e) => handleAdminTaskStatusChange(t.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === "driver" && (
            <div className="user-section table-section">
              <h3>Registered Drivers</h3>
              <p className="section-desc">Drivers registered by admin. You receive this list for booking and trips.</p>
              <table className="fleet-table">
                <thead>
                  <tr><th>Name</th><th>License</th><th>Phone</th><th>Email</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {userDrivers.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center" }}>No drivers registered yet</td></tr>
                  ) : (
                    userDrivers.map((d) => (
                      <tr key={d.id}>
                        <td>{d.name}</td><td>{d.license_no || "—"}</td><td>{d.phone || "—"}</td><td>{d.email || "—"}</td>
                        <td><span className={`status-badge ${d.status}`}>{d.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === "bus" && (
            <div className="user-section table-section">
              <h3>Registered Buses</h3>
              <p className="section-desc">Buses registered by admin. You receive this list for booking and trips.</p>
              <table className="fleet-table">
                <thead>
                  <tr><th>Bus Number</th><th>Plate No</th><th>Capacity</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {userBuses.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: "center" }}>No buses registered yet</td></tr>
                  ) : (
                    userBuses.map((b) => (
                      <tr key={b.id}>
                        <td>{b.bus_number}</td><td>{b.plate_no || "—"}</td><td>{b.capacity}</td>
                        <td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === "settings" && (
            <div className="user-section">
              <h3>Booking Settings</h3>
              <p className="section-desc">Current booking settings (read-only).</p>
              <div className="settings-display">
                <p><strong>Currency:</strong> {bookingSettings.currency || "₵"}</p>
                <p><strong>Default capacity:</strong> {bookingSettings.default_capacity || "—"}</p>
              </div>
            </div>
          )}

          {activeSection === "addtask" && (
            <div className="user-section">
              <h3>Add Task</h3>
              <p className="section-desc">Select a project in Work first, then add a task here or use the + Add Task button in Work.</p>
              {!selectedProjectId ? (
                <p className="work-empty">Go to <button type="button" className="link-btn" onClick={() => setActiveSection("work")}>Work</button> and select a workspace and project.</p>
              ) : (
                <div className="add-task-inline">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setEditingTask(null);
                      setTaskForm({ title: "", description: "", priority: "medium", dueDate: "", status: "todo" });
                      setShowTaskForm(true);
                    }}
                  >
                    + Add New Task
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === "work" && (
            <div className="work-tab-content">
              <aside className="work-sidebar work-inner-sidebar">
                <button
                  type="button"
                  className={`sidebar-item ${myWorkMode ? "active" : ""}`}
                  onClick={() => setMyWorkMode(true)}
                >
                  My Work
                </button>
                <div className="sidebar-section">
                  <div className="sidebar-section-header">
                    <span>Workspaces</span>
                    <button type="button" className="btn-icon" onClick={() => setShowWorkspaceForm(true)} title="New workspace">+</button>
                  </div>
                  {workspaces.map((w) => (
                    <div key={w.id} className="sidebar-workspace">
                      <button
                        type="button"
                        className={`sidebar-item ${selectedWorkspaceId === w.id ? "active" : ""}`}
                        onClick={() => { setSelectedWorkspaceId(w.id); setMyWorkMode(false); }}
                      >
                        {w.name}
                      </button>
                      {selectedWorkspaceId === w.id && (
                        <div className="sidebar-projects">
                          <button type="button" className="btn-add-project" onClick={() => setShowProjectForm(true)}>+ New Project</button>
                          {projects.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              className={`sidebar-item nested ${selectedProjectId === p.id ? "active" : ""}`}
                              onClick={() => { setSelectedProjectId(p.id); setMyWorkMode(false); }}
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </aside>
              <div className="work-content-area">
                {error && <div className="work-error">{error}</div>}
                {loading && <div className="work-loading">Loading...</div>}

                {!myWorkMode && !selectedWorkspaceId && !selectedProjectId && (
                  <div className="work-empty">
                    <p>Select a workspace or project, or add a workspace to get started.</p>
                  </div>
                )}

                {(selectedProjectId || myWorkMode || selectedWorkspaceId) && (
                <>
                  <div className="work-toolbar">
                    <h2 className="work-view-title">
                      {myWorkMode ? "My Work" : selectedProjectId ? "Tasks" : "All tasks"}
                    </h2>
                    {selectedProjectId && (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                          setEditingTask(null);
                          setTaskForm({ title: "", description: "", priority: "medium", dueDate: "", status: "todo" });
                          setShowTaskForm(true);
                        }}
                      >
                        + Add Task
                      </button>
                    )}
                    <div className="view-toggle">
                      <button
                        type="button"
                        className={viewMode === "list" ? "active" : ""}
                        onClick={() => setViewMode("list")}
                      >
                        List
                      </button>
                      <button
                        type="button"
                        className={viewMode === "board" ? "active" : ""}
                        onClick={() => setViewMode("board")}
                      >
                        Board
                      </button>
                    </div>
                  </div>

                  {viewMode === "list" && (
                    <div className="task-list-view">
                      <table className="task-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Due Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayTasks.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="no-data">
                                No tasks yet. Select a project and add a task.
                              </td>
                            </tr>
                          ) : (
                            displayTasks.map((t) => (
                              <tr key={t.id}>
                                <td>{t.title}</td>
                                <td>
                                  <span className={`badge status-${t.status || "todo"}`}>
                                    {t.status || "todo"}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge priority-${t.priority || "medium"}`}>
                                    {t.priority || "medium"}
                                  </span>
                                </td>
                                <td>{t.due_date ? t.due_date.slice(0, 10) : "—"}</td>
                                <td>
                                  <button type="button" className="btn-sm" onClick={() => openEditTask(t)}>
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-sm btn-danger"
                                    onClick={() => {
                                      if (window.confirm("Delete this task?")) deleteTask(t.id);
                                    }}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {viewMode === "board" && (
                    <div className="kanban-board">
                      {KANBAN_COLUMNS.map((col) => (
                        <div key={col.id} className="kanban-column">
                          <h3 className="kanban-column-title">
                            {col.label}
                            <span className="kanban-count">{tasksByStatus(col.id).length}</span>
                          </h3>
                          <div
                            className="kanban-cards"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const taskId = e.dataTransfer.getData("taskId");
                              if (taskId) handleTaskStatusChange(Number(taskId), col.id);
                            }}
                          >
                            {tasksByStatus(col.id).map((t) => (
                              <div
                                key={t.id}
                                className="kanban-card"
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData("taskId", t.id)}
                              >
                                <div className="kanban-card-title">{t.title}</div>
                                <div className="kanban-card-meta">
                                  <span className={`badge priority-${t.priority || "medium"}`}>
                                    {t.priority || "medium"}
                                  </span>
                                  {t.due_date && (
                                    <span className="due">{t.due_date.slice(0, 10)}</span>
                                  )}
                                </div>
                                <div className="kanban-card-actions">
                                  <button type="button" className="btn-sm" onClick={() => openEditTask(t)}>
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-sm btn-danger"
                                    onClick={() => {
                                      if (window.confirm("Delete?")) deleteTask(t.id);
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Workspace modal */}
      {showWorkspaceForm && (
        <div className="modal-overlay" onClick={() => setShowWorkspaceForm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>New Workspace</h3>
            <form onSubmit={handleAddWorkspace}>
              <input
                type="text"
                placeholder="Workspace name *"
                value={workspaceForm.name}
                onChange={(e) => setWorkspaceForm({ ...workspaceForm, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={workspaceForm.description}
                onChange={(e) => setWorkspaceForm({ ...workspaceForm, description: e.target.value })}
                rows={2}
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={() => setShowWorkspaceForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Project modal */}
      {showProjectForm && (
        <div className="modal-overlay" onClick={() => setShowProjectForm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>New Project</h3>
            <form onSubmit={handleAddProject}>
              <input
                type="text"
                placeholder="Project name *"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                rows={2}
              />
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={() => setShowProjectForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Task modal */}
      {showTaskForm && (
        <div className="modal-overlay" onClick={() => { setShowTaskForm(false); setEditingTask(null); }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{editingTask ? "Edit Task" : "New Task"}</h3>
            <form onSubmit={editingTask ? handleUpdateTask : handleAddTask}>
              <input
                type="text"
                placeholder="Task title *"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={2}
              />
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />
              {editingTask && (
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              )}
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  {editingTask ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setShowTaskForm(false); setEditingTask(null); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkDashboard;
