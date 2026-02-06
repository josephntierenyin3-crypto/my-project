import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../api/client";
import "./Admin.css";

const CHART_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const Admin = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [activeSection, setActiveSection] = useState("booking");
  const [workSubTab, setWorkSubTab] = useState("overview");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [adminStats, setAdminStats] = useState({ users: 0, workspaces: 0, projects: 0, tasks: 0, drivers: 0, buses: 0, bookings: 0, revenue: 0 });
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminWorkspaces, setAdminWorkspaces] = useState([]);
  const [adminDbTasks, setAdminDbTasks] = useState([]);
  const [adminDrivers, setAdminDrivers] = useState([]);
  const [adminBuses, setAdminBuses] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [adminTrips, setAdminTrips] = useState([]);
  const [adminTasks, setAdminTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [bookingSettings, setBookingSettings] = useState({});
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState(null);
  const [driverForm, setDriverForm] = useState({ name: "", license_no: "", phone: "", email: "", status: "active" });
  const [busForm, setBusForm] = useState({ bus_number: "", plate_no: "", capacity: "", status: "active" });
  const [settingsForm, setSettingsForm] = useState({ default_capacity: "", currency: "₵", price_per_seat: "" });

  useEffect(() => {
    const loadAdminData = async () => {
      setAdminLoading(true);
      setAdminError(null);
      try {
        const [stats, users, workspaces, dbTasks, drivers, buses, bookings, trips, adminTasksList, analyticsData, settings] = await Promise.all([
          api.admin.stats(),
          api.admin.users(),
          api.admin.workspaces(),
          api.admin.tasks(),
          api.admin.drivers().catch(() => []),
          api.admin.buses().catch(() => []),
          api.admin.bookings().catch(() => []),
          api.trips.list().catch(() => []),
          api.admin.adminTasks().catch(() => []),
          api.admin.analytics().catch(() => null),
          api.admin.bookingSettings().catch(() => ({})),
        ]);
        setAdminStats(stats);
        setAdminUsers(users);
        setAdminWorkspaces(workspaces);
        setAdminDbTasks(dbTasks);
        setAdminDrivers(Array.isArray(drivers) ? drivers : []);
        setAdminBuses(Array.isArray(buses) ? buses : []);
        setAdminBookings(Array.isArray(bookings) ? bookings : []);
        setAdminTrips(Array.isArray(trips) ? trips : []);
        setAdminTasks(Array.isArray(adminTasksList) ? adminTasksList : []);
        setAnalytics(analyticsData);
        setBookingSettings(settings && typeof settings === "object" ? settings : {});
        if (settings && typeof settings === "object") {
          setSettingsForm(prev => ({ ...prev, default_capacity: settings.default_capacity || "", currency: settings.currency || "₵" }));
        }
      } catch (err) {
        setAdminError(err.message || "Failed to load admin data");
      } finally {
        setAdminLoading(false);
      }
    };
    loadAdminData();
  }, []);

  // Refetch trips when opening Trips section so admin sees newly created trips with auto-count
  useEffect(() => {
    if (activeSection === "trips") {
      api.trips.list().then((list) => setAdminTrips(Array.isArray(list) ? list : [])).catch(() => {});
    }
  }, [activeSection]);

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    if (!driverForm.name.trim()) { alert("Driver name required"); return; }
    try {
      const created = await api.admin.createDriver(driverForm);
      setAdminDrivers(prev => [created, ...prev]);
      setDriverForm({ name: "", license_no: "", phone: "", email: "", status: "active" });
    } catch (err) { alert(err.message || "Failed to add driver"); }
  };

  const handleBusSubmit = async (e) => {
    e.preventDefault();
    if (!busForm.bus_number.trim()) { alert("Bus number required"); return; }
    try {
      const created = await api.admin.createBus({ ...busForm, capacity: Number(busForm.capacity) || 0 });
      setAdminBuses(prev => [created, ...prev]);
      setBusForm({ bus_number: "", plate_no: "", capacity: "", status: "active" });
    } catch (err) { alert(err.message || "Failed to add bus"); }
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    try {
      await api.admin.updateBookingSetting({ key: "default_capacity", value: settingsForm.default_capacity });
      await api.admin.updateBookingSetting({ key: "currency", value: settingsForm.currency });
      await api.admin.updateBookingSetting({ key: "price_per_seat", value: settingsForm.price_per_seat });
      setAdminError(null);
      alert("Booking settings saved.");
    } catch (err) { setAdminError(err.message); }
  };

  const handleApproveBooking = async (id) => {
    try {
      await api.admin.approveBooking(id);
      setAdminBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "approved" } : b)));
      setAdminStats((prev) => ({ ...prev, bookings: prev.bookings, revenue: prev.revenue }));
      const list = await api.admin.bookings();
      setAdminBookings(Array.isArray(list) ? list : []);
      const st = await api.admin.stats();
      setAdminStats(st);
    } catch (err) {
      alert(err.message || "Failed to approve");
    }
  };

  const handleMarkTripReached = async (tripId) => {
    try {
      await api.trips.update(tripId, { status: "reached" });
      setAdminTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status: "reached" } : t)));
    } catch (err) {
      alert(err.message || "Failed to update trip");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleTaskFormChange = (e) => {
    setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title) {
      alert("Please enter a task title");
      return;
    }
    try {
      await api.admin.createAdminTask({
        title: taskForm.title,
        description: taskForm.description || "",
        due_date: taskForm.dueDate || null,
      });
      const list = await api.admin.adminTasks();
      setAdminTasks(Array.isArray(list) ? list : []);
      setTaskForm({ title: "", description: "", dueDate: "" });
      setShowTaskForm(false);
      alert("Task added. Users will see it and can update status.");
    } catch (err) {
      alert(err.message || "Failed to add task");
    }
  };

  const SIDEBAR_ITEMS = [
    { id: "booking", label: "Booking" },
    { id: "trips", label: "Trips (Bus + Driver + Auto-count)" },
    { id: "work", label: "Work" },
    { id: "analytics", label: "Analytics & Financial" },
    { id: "driver", label: "Driver Registration" },
    { id: "bus", label: "Bus Registration" },
    { id: "settings", label: "Booking Settings" },
    { id: "addtask", label: "Add Task" },
  ];

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h2>Admin Dashboard</h2>
        <div className="admin-header-right">
          <span className="admin-welcome">Welcome, {user?.name || user?.email}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`admin-nav-item ${activeSection === item.id ? "active" : ""}`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="admin-main">
          {adminError && <div className="admin-error">{adminError}</div>}
          {adminLoading && activeSection !== "booking" && activeSection !== "addtask" && <p className="admin-loading">Loading...</p>}

          {/* ----- Booking ----- */}
          {activeSection === "booking" && (
            <div className="admin-section table-section">
              <h3>Booking</h3>
              <p className="section-desc">View and approve all bookings (from users).</p>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Start journey</th>
                    <th>Destination</th>
                    <th>User</th>
                    <th>Passenger</th>
                    <th>Bus</th>
                    <th>Car Reg</th>
                    <th>Pax</th>
                    <th>Amount (₵)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminBookings.length === 0 ? (
                    <tr><td colSpan="11" style={{ textAlign: "center" }}>No bookings yet</td></tr>
                  ) : (
                    adminBookings.map(s => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.start_journey || "—"}</td>
                        <td>{s.destination || "—"}</td>
                        <td>{s.user_name || s.user_email || `#${s.user_id}`}</td>
                        <td>{s.passenger_name}</td>
                        <td>{s.bus_number}</td>
                        <td>{s.car_reg || "—"}</td>
                        <td>{s.passengers ?? "—"}</td>
                        <td>{bookingSettings.currency || "₵"} {Number(s.amount).toFixed(2)}</td>
                        <td><span className={`status-badge ${(s.status || "pending").toLowerCase()}`}>{s.status || "pending"}</span></td>
                        <td>
                          {(s.status || "pending") === "pending" && (
                            <button className="approve-btn" onClick={() => handleApproveBooking(s.id)}>Approve</button>
                          )}
                          {(s.status || "pending") === "approved" && <span className="approved-text">✓ Approved</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ----- Work ----- */}
          {activeSection === "work" && (
            <div className="admin-section">
              <h3>Work</h3>
              <p className="section-desc">Overview, users, workspaces, and database tasks.</p>
              <div className="work-sub-tabs">
                {["overview", "users", "workspaces", "tasks"].map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    className={workSubTab === sub ? "active" : ""}
                    onClick={() => setWorkSubTab(sub)}
                  >
                    {sub.charAt(0).toUpperCase() + sub.slice(1)}
                  </button>
                ))}
              </div>
              {workSubTab === "overview" && (
        <div className="overview-section">
          {adminError && <div className="admin-error">{adminError}</div>}
          {adminLoading && <p className="admin-loading">Loading...</p>}
          <div className="stats-grid stats-grid-wide">
            <div className="stat-card">
              <p>Users (DB)</p>
              <h3>{adminStats.users}</h3>
              <div className="stat-details"><span>Registered users</span></div>
            </div>
            <div className="stat-card">
              <p>Workspaces (DB)</p>
              <h3>{adminStats.workspaces}</h3>
              <div className="stat-details"><span>Total workspaces</span></div>
            </div>
            <div className="stat-card">
              <p>Projects (DB)</p>
              <h3>{adminStats.projects}</h3>
              <div className="stat-details"><span>Total projects</span></div>
            </div>
            <div className="stat-card">
              <p>Tasks (DB)</p>
              <h3>{adminStats.tasks}</h3>
              <div className="stat-details"><span>Tasks in database</span></div>
            </div>
            <div className="stat-card">
              <p>Drivers</p>
              <h3>{adminStats.drivers ?? 0}</h3>
              <div className="stat-details"><span>Registered drivers</span></div>
            </div>
            <div className="stat-card">
              <p>Buses</p>
              <h3>{adminStats.buses ?? 0}</h3>
              <div className="stat-details"><span>Registered buses</span></div>
            </div>
            <div className="stat-card">
              <p>Admin Tasks</p>
              <h3>{adminTasks.length}</h3>
              <div className="stat-details">
                <span>Pending: {adminTasks.filter((t) => (t.status || "pending") === "pending").length}</span>
                <span>Done: {adminTasks.filter((t) => (t.status || "") === "done").length}</span>
              </div>
            </div>
            <div className="stat-card">
              <p>Bookings (DB)</p>
              <h3>{adminStats.bookings ?? 0}</h3>
              <div className="stat-details">
                <span>From users</span>
              </div>
            </div>
            <div className="stat-card">
              <p>Revenue</p>
              <h3>{bookingSettings.currency || "₵"} {(adminStats.revenue ?? 0).toFixed(2)}</h3>
              <div className="stat-details">
                <span>Approved bookings</span>
              </div>
            </div>
          </div>
        </div>
              )}
              {workSubTab === "users" && (
                <div className="table-section">
                  <h4>All Users (Database)</h4>
                  <table>
                    <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
                    <tbody>
                      {adminUsers.length === 0 ? <tr><td colSpan="5" style={{ textAlign: "center" }}>No users</td></tr> : adminUsers.map((u) => (
                        <tr key={u.id}><td>{u.id}</td><td>{u.username}</td><td>{u.email}</td><td><span className={`role-badge ${u.role}`}>{u.role}</span></td><td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {workSubTab === "workspaces" && (
                <div className="table-section">
                  <h4>All Workspaces (Database)</h4>
                  <table>
                    <thead><tr><th>ID</th><th>Name</th><th>Owner</th><th>Description</th><th>Created</th></tr></thead>
                    <tbody>
                      {adminWorkspaces.length === 0 ? <tr><td colSpan="5" style={{ textAlign: "center" }}>No workspaces</td></tr> : adminWorkspaces.map((w) => (
                        <tr key={w.id}><td>{w.id}</td><td>{w.name}</td><td>{w.owner_name || "—"}</td><td>{(w.description || "—").slice(0, 40)}{(w.description && w.description.length > 40) ? "…" : ""}</td><td>{w.created_at ? new Date(w.created_at).toLocaleDateString() : "—"}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {workSubTab === "tasks" && (
                <div className="table-section">
                  <h4>All Tasks (Database)</h4>
                  <table>
                    <thead><tr><th>ID</th><th>Title</th><th>Project</th><th>Workspace</th><th>Status</th><th>Priority</th><th>Due Date</th></tr></thead>
                    <tbody>
                      {adminDbTasks.length === 0 ? <tr><td colSpan="7" style={{ textAlign: "center" }}>No tasks</td></tr> : adminDbTasks.map((t) => (
                        <tr key={t.id}><td>{t.id}</td><td>{(t.title || "").slice(0, 50)}{(t.title && t.title.length > 50) ? "…" : ""}</td><td>{t.project_name || "—"}</td><td>{t.workspace_name || "—"}</td><td><span className={`status-badge ${(t.status || "todo").toLowerCase()}`}>{t.status || "todo"}</span></td><td><span className={`priority-badge ${(t.priority || "medium").toLowerCase()}`}>{t.priority || "medium"}</span></td><td>{t.due_date ? t.due_date.slice(0, 10) : "—"}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ----- Trips (same as user: bus + driver + auto-count) ----- */}
          {activeSection === "trips" && (
            <div className="admin-section">
              <h3>Trips (Bus + Driver + Date/Time)</h3>
              <p className="section-desc">All trips created by users. Auto-count: Bookings / Capacity. When status is Reached, no more bookings accepted. Same list visible to user.</p>
              <div className="table-section" style={{ marginTop: "1rem" }}>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
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
                    {adminTrips.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: "center" }}>No trips yet. Users create trips from the user dashboard.</td></tr>
                    ) : (
                      adminTrips.map((t) => (
                        <tr key={t.id}>
                          <td>{t.id}</td>
                          <td>{t.bus_number || "—"}</td>
                          <td>{t.driver_name || "—"}</td>
                          <td>{t.scheduled_at ? new Date(t.scheduled_at).toLocaleString() : "—"}</td>
                          <td>{t.expected_arrival_at ? new Date(t.expected_arrival_at).toLocaleString() : "—"}</td>
                          <td><strong>{t.booking_count ?? 0}</strong> / {t.max_capacity ?? "∞"}</td>
                          <td><span className={`status-badge ${(t.status || "scheduled").toLowerCase()}`}>{t.status || "scheduled"}</span></td>
                          <td>
                            {(t.status || "scheduled") !== "reached" && (t.status || "") !== "completed" && (
                              <button type="button" className="approve-btn" onClick={() => handleMarkTripReached(t.id)}>Mark Reached</button>
                            )}
                            {(t.status || "") === "reached" && <span className="approved-text">Reached</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ----- Analytics & Financial ----- */}
          {activeSection === "analytics" && (
            <div className="admin-section analytics-section">
              <h3>Analytics & Financial Details</h3>
              <p className="section-desc">Booking status and revenue breakdown with pie charts.</p>
              {analytics && (
                <>
                  <div className="analytics-charts">
                    <div className="chart-box">
                      <h4>Booking Status</h4>
                      {(analytics.bookingStatusPie || []).length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={analytics.bookingStatusPie}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}`}
                              outerRadius={70}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {(analytics.bookingStatusPie || []).map((_, i) => (
                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="no-data-text">No booking data</p>
                      )}
                    </div>
                    <div className="chart-box">
                      <h4>Revenue by Bus</h4>
                      {(analytics.revenueByBusPie || []).length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={analytics.revenueByBusPie}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${analytics.currency || "₵"}${value}`}
                              outerRadius={70}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {(analytics.revenueByBusPie || []).map((_, i) => (
                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v) => `${analytics.currency || "₵"}${v}`} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="no-data-text">No revenue data</p>
                      )}
                    </div>
                  </div>
                  <div className="financial-summary">
                    <p><strong>Total revenue (approved):</strong> {analytics.currency || "₵"} {(analytics.totalRevenue || 0).toFixed(2)}</p>
                    <p><strong>Total pending amount:</strong> {analytics.currency || "₵"} {(analytics.totalPending || 0).toFixed(2)}</p>
                  </div>
                  <div className="table-section">
                    <h4>Financial Details (All Bookings)</h4>
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Passenger</th>
                          <th>Bus</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(analytics.financialDetails || []).length === 0 ? (
                          <tr><td colSpan={6} style={{ textAlign: "center" }}>No bookings</td></tr>
                        ) : (
                          (analytics.financialDetails || []).map((row) => (
                            <tr key={row.id}>
                              <td>{row.id}</td>
                              <td>{row.passenger_name}</td>
                              <td>{row.bus_number}</td>
                              <td>{analytics.currency || "₵"} {Number(row.amount).toFixed(2)}</td>
                              <td><span className={`status-badge ${(row.status || "pending").toLowerCase()}`}>{row.status || "pending"}</span></td>
                              <td>{row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              {!analytics && <p className="admin-loading">Loading analytics...</p>}
            </div>
          )}

          {/* ----- Driver Registration ----- */}
          {activeSection === "driver" && (
            <div className="admin-section">
              <h3>Driver Registration</h3>
              <p className="section-desc">Register new drivers.</p>
              <form className="admin-form" onSubmit={handleDriverSubmit}>
                <input type="text" placeholder="Driver Name *" value={driverForm.name} onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })} required />
                <input type="text" placeholder="License No" value={driverForm.license_no} onChange={(e) => setDriverForm({ ...driverForm, license_no: e.target.value })} />
                <input type="text" placeholder="Phone" value={driverForm.phone} onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })} />
                <input type="email" placeholder="Email" value={driverForm.email} onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })} />
                <select value={driverForm.status} onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button type="submit">Register Driver</button>
              </form>
              <div className="table-section" style={{ marginTop: "1.5rem" }}>
                <h4>Registered Drivers</h4>
                <table>
                  <thead><tr><th>ID</th><th>Name</th><th>License</th><th>Phone</th><th>Email</th><th>Status</th></tr></thead>
                  <tbody>
                    {adminDrivers.length === 0 ? <tr><td colSpan="6" style={{ textAlign: "center" }}>No drivers yet</td></tr> : adminDrivers.map((d) => (
                      <tr key={d.id}><td>{d.id}</td><td>{d.name}</td><td>{d.license_no || "—"}</td><td>{d.phone || "—"}</td><td>{d.email || "—"}</td><td><span className={`status-badge ${d.status}`}>{d.status}</span></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ----- Bus Registration ----- */}
          {activeSection === "bus" && (
            <div className="admin-section">
              <h3>Bus Registration</h3>
              <p className="section-desc">Register new buses.</p>
              <form className="admin-form" onSubmit={handleBusSubmit}>
                <input type="text" placeholder="Bus Number *" value={busForm.bus_number} onChange={(e) => setBusForm({ ...busForm, bus_number: e.target.value })} required />
                <input type="text" placeholder="Plate No" value={busForm.plate_no} onChange={(e) => setBusForm({ ...busForm, plate_no: e.target.value })} />
                <input type="number" placeholder="Capacity" value={busForm.capacity} onChange={(e) => setBusForm({ ...busForm, capacity: e.target.value })} />
                <select value={busForm.status} onChange={(e) => setBusForm({ ...busForm, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button type="submit">Register Bus</button>
              </form>
              <div className="table-section" style={{ marginTop: "1.5rem" }}>
                <h4>Registered Buses</h4>
                <table>
                  <thead><tr><th>ID</th><th>Bus Number</th><th>Plate No</th><th>Capacity</th><th>Status</th></tr></thead>
                  <tbody>
                    {adminBuses.length === 0 ? <tr><td colSpan="5" style={{ textAlign: "center" }}>No buses yet</td></tr> : adminBuses.map((b) => (
                      <tr key={b.id}><td>{b.id}</td><td>{b.bus_number}</td><td>{b.plate_no || "—"}</td><td>{b.capacity}</td><td><span className={`status-badge ${b.status}`}>{b.status}</span></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ----- Booking Settings ----- */}
          {activeSection === "settings" && (
            <div className="admin-section">
              <h3>Booking Settings</h3>
              <p className="section-desc">Configure default values for bookings.</p>
              <form className="admin-form" onSubmit={handleSettingsSave}>
                <div className="form-group">
                  <label>Default capacity (seats per bus)</label>
                  <input type="number" placeholder="30" min="1" value={settingsForm.default_capacity} onChange={(e) => setSettingsForm({ ...settingsForm, default_capacity: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Currency symbol</label>
                  <input type="text" placeholder="₵" value={settingsForm.currency} onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Price per seat (cedis)</label>
                  <input type="number" placeholder="e.g. 50" min="0" step="0.01" value={settingsForm.price_per_seat} onChange={(e) => setSettingsForm({ ...settingsForm, price_per_seat: e.target.value })} />
                </div>
                <button type="submit">Save Settings</button>
              </form>
            </div>
          )}

          {/* ----- Add Task ----- */}
          {activeSection === "addtask" && (
        <div className="tasks-management">
          <div className="tasks-header">
            <h3>Task Management</h3>
            <button 
              className="add-task-btn"
              onClick={() => {
                setShowTaskForm(true);
                setTaskForm({ title: "", description: "", dueDate: "" });
              }}
            >
              + Add New Task
            </button>
          </div>

          {/* Task Form */}
          {showTaskForm && (
            <div className="task-form-section">
              <h4>Create New Task (visible to users)</h4>
              <form onSubmit={handleTaskSubmit} className="task-form-grid">
                <input
                  name="title"
                  placeholder="Task Title *"
                  value={taskForm.title}
                  onChange={handleTaskFormChange}
                  required
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  value={taskForm.description}
                  onChange={handleTaskFormChange}
                  rows="3"
                />
                <input
                  type="date"
                  name="dueDate"
                  value={taskForm.dueDate}
                  onChange={handleTaskFormChange}
                />
                <div className="task-form-actions">
                  <button type="submit">Save Task</button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowTaskForm(false);
                      setTaskForm({ title: "", description: "", dueDate: "" });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Admin Tasks List (users see and update these) */}
          <div className="tasks-table-section">
            <h4>Admin Tasks (reflected to users)</h4>
            {adminTasks.length === 0 ? (
              <p className="no-data">No admin tasks yet. Create one above!</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminTasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.title}</td>
                      <td>{(task.description || "—").slice(0, 50)}{(task.description && task.description.length > 50) ? "…" : ""}</td>
                      <td>{task.due_date ? task.due_date.slice(0, 10) : "—"}</td>
                      <td><span className={`status-badge ${(task.status || "pending").toLowerCase()}`}>{task.status || "pending"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
