import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
  tasks: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
  bookings: ['#8884d8', '#82ca9d', '#ffc658'],
  priority: ['#d1ecf1', '#fff3cd', '#f8d7da'],
  status: ['#fff3cd', '#d4edda', '#f8d7da']
};

// Task Status Pie Chart
export const TaskStatusChart = ({ tasks }) => {
  const data = [
    { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length },
  ].filter(item => item.value > 0);

  return (
    <div className="chart-container">
      <h4>Task Status Distribution</h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS.tasks[index % COLORS.tasks.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Booking Status Pie Chart
export const BookingStatusChart = ({ submissions }) => {
  const data = [
    { name: 'Pending', value: submissions.filter(s => s.status === 'pending').length },
    { name: 'Approved', value: submissions.filter(s => s.status === 'approved').length },
  ].filter(item => item.value > 0);

  return (
    <div className="chart-container">
      <h4>Booking Status Distribution</h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS.bookings[index % COLORS.bookings.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Task Priority Pie Chart
export const TaskPriorityChart = ({ tasks }) => {
  const data = [
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
  ].filter(item => item.value > 0);

  return (
    <div className="chart-container">
      <h4>Task Priority Distribution</h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS.priority[index % COLORS.priority.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Revenue Breakdown Chart
export const RevenueChart = ({ submissions }) => {
  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  const totalRevenue = approvedSubmissions.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  
  // Group by passenger name or bus number for breakdown
  const revenueByPassenger = {};
  approvedSubmissions.forEach(s => {
    const key = s.passengerName || 'Unknown';
    revenueByPassenger[key] = (revenueByPassenger[key] || 0) + (Number(s.amount) || 0);
  });

  const data = Object.entries(revenueByPassenger)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5

  if (data.length === 0) {
    return (
      <div className="chart-container">
        <h4>Revenue Breakdown</h4>
        <p className="no-data-text">No revenue data available</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h4>Top Revenue Sources</h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ₵${value.toFixed(2)}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS.tasks[index % COLORS.tasks.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₵${value.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Overall Statistics Chart
export const OverallStatsChart = ({ taskCounts, submissionCounts }) => {
  const data = [
    { name: 'Total Tasks', value: taskCounts.total },
    { name: 'Total Bookings', value: submissionCounts.total },
    { name: 'Completed Tasks', value: taskCounts.completed },
    { name: 'Approved Bookings', value: submissionCounts.approved },
  ].filter(item => item.value > 0);

  return (
    <div className="chart-container">
      <h4>Overall Statistics</h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS.tasks[index % COLORS.tasks.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

