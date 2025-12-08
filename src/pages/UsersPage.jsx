// src/pages/UsersPage.jsx
import { useState, useEffect } from "react";
import "./UsersPage.css";

const usersData = [
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

function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem("admin_users");
    if (stored) {
      return JSON.parse(stored);
    }
    return usersData;
  });

  useEffect(() => {
    localStorage.setItem("admin_users", JSON.stringify(users));
  }, [users]);

  // 🔹 Add User form state'leri
  const [isAdding, setIsAdding] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("User");
  const [newUserStatus, setNewUserStatus] = useState("Active");
  const [addError, setAddError] = useState("");


const handleAddUser = () => {
  setAddError("");

  if (!newUserName || !newUserEmail) {
    setAddError("Name and email are required.");
    return;
  }

  const newUser = {
    id: Date.now(),
    name: newUserName,
    email: newUserEmail,
    role: newUserRole,
    status: newUserStatus,
  };

  setUsers((prevUsers) => [...prevUsers, newUser]);

  setNewUserName("");
  setNewUserEmail("");
  setNewUserRole("User");
  setNewUserStatus("Active");
  setIsAdding(false);
};




  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <h2>Users</h2>

        <button
          className="add-user-btn"
          onClick={() => setIsAdding(true)}
        >
          + Add User
        </button>

        <div className="filters">
          <button
            className={`filter-btn ${
              statusFilter === "all" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("all")}
          >
            All
          </button>

          <button
            className={`filter-btn ${
              statusFilter === "Active" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("Active")}
          >
            Active
          </button>

          <button
            className={`filter-btn ${
              statusFilter === "Inactive" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("Inactive")}
          >
            Inactive
          </button>
        </div>

        <input
          type="text"
          placeholder="Search user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

{isAdding && (
  <div className="add-user-panel">
    <div className="add-user-header">
      <h3>New User</h3>
      <span className="add-user-subtitle">Fill in the details and save the user.</span>
    </div>

    <div className="add-user-grid">
      <input
        type="text"
        placeholder="Full name"
        value={newUserName}
        onChange={(e) => setNewUserName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email address"
        value={newUserEmail}
        onChange={(e) => setNewUserEmail(e.target.value)}
      />

      <select
        value={newUserRole}
        onChange={(e) => setNewUserRole(e.target.value)}
      >
        <option value="User">User</option>
        <option value="Admin">Admin</option>
        <option value="Moderator">Moderator</option>
      </select>

      <select
        value={newUserStatus}
        onChange={(e) => setNewUserStatus(e.target.value)}
      >
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>
    </div>
{addError && (
  <p className="add-user-error">
    {addError}
  </p>
)}

    <div className="add-user-actions">
      <button className="btn-primary" onClick={handleAddUser}>
        Add User
      </button>
      <button className="btn-ghost" onClick={() => setIsAdding(false)}>
        Cancel
      </button>
    </div>
  </div>
)}


      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>

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

              <td>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

export default UsersPage;
