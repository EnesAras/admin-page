// src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import "./DashboardPage.css";

const fallbackUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "johndoe36@kars.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "janesmith36@kars.com",
    role: "User",
    status: "Inactive",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mikejohnson36@kars.com",
    role: "Moderator",
    status: "Active",
  },
];

function DashboardPage() {
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem("admin_users");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (err) {
        console.error("admin_users parse error:", err);
      }
    }
    return fallbackUsers;
  });

  useEffect(() => {
    const stored = localStorage.getItem("admin_users");
    if (stored) {
      try {
        setUsers(JSON.parse(stored));
      } catch (err) {
        console.error("admin_users parse error:", err);
      }
    }
  }, []);

  // 🔹 Basit istatistikler
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const inactiveUsers = users.filter((u) => u.status === "Inactive").length;
  const adminCount = users.filter((u) => u.role === "Admin").length;

const recentUsers = [...users]
  .sort((a, b) => {
    if (a.role === "Admin" && b.role !== "Admin") return -1;
    if (a.role !== "Admin" && b.role === "Admin") return 1;
    return b.id - a.id; 
  })
  .slice(0, 5);
;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard</h2>
          <p className="dashboard-subtitle">
            Quick overview of your users and activity.
          </p>
        </div>
      </div>

      {/* 🔹 İstatistik kartları */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total Users</p>
          <p className="stat-value">{totalUsers}</p>
          <p className="stat-hint">All registered users</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Active Users</p>
          <p className="stat-value">{activeUsers}</p>
          <p className="stat-hint">Currently marked as active</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Inactive Users</p>
          <p className="stat-value">{inactiveUsers}</p>
          <p className="stat-hint">Need your attention</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Admins</p>
          <p className="stat-value">{adminCount}</p>
          <p className="stat-hint">Users with full access</p>
        </div>
      </div>

      {/* 🔹 Son kullanıcılar */}
      <div className="recent-card">
        <div className="recent-header">
          <h3>Recent Users</h3>
          <span className="recent-count">{recentUsers.length} users</span>
        </div>

        <table className="recent-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td className="recent-email">{user.email}</td>
                <td>
                  <span
                    className={`role-badge role-${user.role.toLowerCase()}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-badge status-${user.status.toLowerCase()}`}
                  >
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
            {recentUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="recent-empty">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardPage;
