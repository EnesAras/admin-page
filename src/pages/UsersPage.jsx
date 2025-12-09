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

  // 🔐 Şimdilik sabit: giriş yapan kullanıcının rolü
  const CURRENT_USER_ROLE = "Admin"; // "Moderator" veya "User" yapıp test edebilirsin

  // Sadece Admin edit yapabilsin
  const canEditUsers = CURRENT_USER_ROLE === "Admin";

  // Admin + Moderator status değiştirebilsin
  const canToggleStatus =
    CURRENT_USER_ROLE === "Admin" || CURRENT_USER_ROLE === "Moderator";

  // 🔹 Add User form state'leri
  const [isAdding, setIsAdding] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("User");
  const [newUserStatus, setNewUserStatus] = useState("Active");
  const [addError, setAddError] = useState("");

  // 🔹 Edit User state'leri
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState("User");
  const [editUserStatus, setEditUserStatus] = useState("Active");

  // ✅ Add User
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

  // ✅ Update (Edit) User
  const handleUpdateUser = () => {
    if (!editUserName || !editUserEmail) return;

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === editingUserId
          ? {
              ...user,
              name: editUserName,
              email: editUserEmail,
              role: editUserRole,
              status: editUserStatus,
            }
          : user
      )
    );

    setIsEditing(false);
    setEditingUserId(null);
    setEditUserName("");
    setEditUserEmail("");
    setEditUserRole("User");
    setEditUserStatus("Active");
  };

  const handleEditClick = (user) => {
    if (!canEditUsers) return; // yetkisi yoksa çık

    setIsAdding(false); // Add panel açıksa kapat
    setIsEditing(true); // Edit panelini aç

    setEditingUserId(user.id);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserRole(user.role);
    setEditUserStatus(user.status);
  };

  // ✅ Status toggle
  const handleToggleStatus = (id) => {
    if (!canToggleStatus) return; // yetkisi yoksa çık

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Active" ? "Inactive" : "Active",
            }
          : user
      )
    );
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
          onClick={() => {
            setIsAdding(true);
            setIsEditing(false); // edit açıksa kapat
          }}
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

      {/* ✅ Add User panel */}
      {isAdding && (
        <div className="add-user-panel">
          <div className="add-user-header">
            <h3>New User</h3>
            <span className="add-user-subtitle">
              Fill in the details and save the user.
            </span>
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

          {addError && <p className="add-user-error">{addError}</p>}

          <div className="add-user-actions">
            <button className="btn-primary" onClick={handleAddUser}>
              Add User
            </button>
            <button
              className="btn-ghost"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ✅ Edit User panel */}
      {isEditing && canEditUsers && (
        <div className="add-user-panel">
          <div className="add-user-header">
            <h3>Edit User</h3>
            <span className="add-user-subtitle">
              Update the user information and save changes.
            </span>
          </div>

          <div className="add-user-grid">
            <input
              type="text"
              placeholder="Full name"
              value={editUserName}
              onChange={(e) => setEditUserName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email address"
              value={editUserEmail}
              onChange={(e) => setEditUserEmail(e.target.value)}
            />

            <select
              value={editUserRole}
              onChange={(e) => setEditUserRole(e.target.value)}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
              <option value="Moderator">Moderator</option>
            </select>

            <select
              value={editUserStatus}
              onChange={(e) => setEditUserStatus(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="add-user-actions">
            <button className="btn-primary" onClick={handleUpdateUser}>
              Save Changes
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                setIsEditing(false);
                setEditingUserId(null);
                setEditUserName("");
                setEditUserEmail("");
                setEditUserRole("User");
                setEditUserStatus("Active");
              }}
            >
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
                  className={`status-badge status-${user.status.toLowerCase()} ${
                    canToggleStatus ? "clickable" : ""
                  }`}
                  onClick={() => handleToggleStatus(user.id)}
                >
                  {user.status}
                </span>
              </td>

              <td>
                {canEditUsers && (
                  <button
                    className="edit-btn"
                    onClick={() => handleEditClick(user)}
                  >
                    Edit
                  </button>
                )}

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
