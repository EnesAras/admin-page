// src/pages/UsersPage.jsx
import { useState, useEffect } from "react";
import "./UsersPage.css";
import { useSettings } from "../context/SettingsContext";
import translations from "../i18n/translations";

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

function UsersPage({ language }) {
  const { settings, language: ctxLanguage } = useSettings();

  // Dil önceliği: prop > context.language > settings.language > "en"
  const lang = language || ctxLanguage || settings?.language || "en";

  const dict = translations[lang] || translations.en;

  const t = (key, fallback) => {
    if (dict && dict[key] !== undefined) return dict[key];
    if (translations.en && translations.en[key] !== undefined)
      return translations.en[key];
    if (fallback !== undefined) return fallback;
    return key;
  };

  const roleLabel = (role) => {
    if (!role) return "";
    let key = "roleUser";
    if (role === "Admin") key = "roleAdmin";
    else if (role === "Moderator") key = "roleModerator";
    return t(key, role);
  };

  const statusLabel = (status) => {
    if (!status) return "";
    let key = "statusActive";
    if (status === "Inactive") key = "statusInactive";
    return t(key, status);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem("admin_users");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return usersData;
      }
    }
    return usersData;
  });

  useEffect(() => {
    localStorage.setItem("admin_users", JSON.stringify(users));
  }, [users]);

  const CURRENT_USER_ROLE = "Admin";
  const canEditUsers = CURRENT_USER_ROLE === "Admin";
  const canToggleStatus =
    CURRENT_USER_ROLE === "Admin" || CURRENT_USER_ROLE === "Moderator";

  const [isAdding, setIsAdding] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("User");
  const [newUserStatus, setNewUserStatus] = useState("Active");
  const [addError, setAddError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState("User");
  const [editUserStatus, setEditUserStatus] = useState("Active");

  // Sıralama state'i
  const [sortBy, setSortBy] = useState("id"); // "id" | "name" | "email" | "role" | "status"
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" | "desc"

  function isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email.trim());
  }

  function isValidName(name) {
    const pattern = /^[a-zA-ZğüşöçıİĞÜŞÖÇ\s]+$/;
    return pattern.test(name.trim());
  }

  const isNewNameInvalid =
    newUserName.trim() !== "" && !isValidName(newUserName);
  const isNewEmailInvalid =
    newUserEmail.trim() !== "" && !isValidEmail(newUserEmail);
  const isNewEmailDuplicate =
    newUserEmail.trim() !== "" &&
    users.some(
      (u) => u.email.toLowerCase() === newUserEmail.trim().toLowerCase()
    );

  const isAddFormInvalid =
    !newUserName.trim() ||
    !newUserEmail.trim() ||
    isNewNameInvalid ||
    isNewEmailInvalid ||
    isNewEmailDuplicate;

  const handleAddUser = () => {
    setAddError("");

    if (!newUserName.trim() || !newUserEmail.trim()) {
      setAddError(
        t("users.error.nameRequired", "Name and email are required.")
      );
      return;
    }

    if (!isValidName(newUserName)) {
      setAddError(
        t(
          "users.error.nameLettersOnly",
          "Name can only contain letters and spaces."
        )
      );
      return;
    }

    if (!isValidEmail(newUserEmail)) {
      setAddError(
        t(
          "users.error.emailInvalid",
          "Please enter a valid email address."
        )
      );
      return;
    }

    const emailExists = users.some(
      (u) => u.email.toLowerCase() === newUserEmail.trim().toLowerCase()
    );
    if (emailExists) {
      setAddError(
        t(
          "users.error.emailExists",
          "This email is already registered."
        )
      );
      return;
    }

    const nextId =
      users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;

    const newUser = {
      id: nextId,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
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

  const handleUpdateUser = () => {
    if (!editUserName.trim() || !editUserEmail.trim()) {
      alert(
        t("users.error.nameRequired", "Name and email are required.")
      );
      return;
    }

    if (!isValidName(editUserName)) {
      alert(
        t(
          "users.error.nameLettersOnly",
          "Name can only contain letters and spaces."
        )
      );
      return;
    }

    if (!isValidEmail(editUserEmail)) {
      alert(
        t(
          "users.error.emailInvalid",
          "Please enter a valid email address."
        )
      );
      return;
    }

    const emailTaken = users.some(
      (u) =>
        u.id !== editingUserId &&
        u.email.toLowerCase() === editUserEmail.trim().toLowerCase()
    );

    if (emailTaken) {
      alert(
        t(
          "users.error.emailUsed",
          "This email is already registered for another user."
        )
      );
      return;
    }

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === editingUserId
          ? {
              ...user,
              name: editUserName.trim(),
              email: editUserEmail.trim(),
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
    if (!canEditUsers) return;

    setIsAdding(false);
    setIsEditing(true);

    setEditingUserId(user.id);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserRole(user.role);
    setEditUserStatus(user.status);
  };

  const handleToggleStatus = (id) => {
    if (!canToggleStatus) return;

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

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let valA;
    let valB;

    switch (sortBy) {
      case "name":
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        break;
      case "email":
        valA = a.email.toLowerCase();
        valB = b.email.toLowerCase();
        break;
      case "role":
        valA = a.role.toLowerCase();
        valB = b.role.toLowerCase();
        break;
      case "status":
        valA = a.status.toLowerCase();
        valB = b.status.toLowerCase();
        break;
      case "id":
      default:
        valA = a.id;
        valB = b.id;
        break;
    }

    if (typeof valA === "string" && typeof valB === "string") {
      const cmp = valA.localeCompare(valB);
      return sortDirection === "asc" ? cmp : -cmp;
    }

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleDelete = (id) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  };

  const handleSort = (column) => {
    setSortBy((prevSortBy) => {
      if (prevSortBy === column) {
        setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevSortBy;
      } else {
        setSortDirection("asc");
        return column;
      }
    });
  };

  const renderSortIndicator = (column) => {
    if (sortBy !== column) return null;
    return (
      <span className="sort-indicator">
        {sortDirection === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  // Canlı istatistikler
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.status === "Active").length;
  const inactiveCount = users.filter((u) => u.status === "Inactive").length;

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="users-container">
      {/* HEADER */}
      <div className="users-header">
        <div className="users-header-top">
          <h2>{t("users.title", "Users")}</h2>

          {/* Canlı küçük istatistikler */}
          <div className="users-stats">
            <div className="users-stat-pill">
              <span className="label">
                {t("users.stats.total", "Total")}
              </span>
              <span className="value">{totalCount}</span>
            </div>
            <div className="users-stat-pill users-stat-active">
              <span className="label">
                {t("users.stats.active", "Active")}
              </span>
              <span className="value">{activeCount}</span>
            </div>
            <div className="users-stat-pill users-stat-inactive">
              <span className="label">
                {t("users.stats.inactive", "Inactive")}
              </span>
              <span className="value">{inactiveCount}</span>
            </div>
          </div>
        </div>

        <div className="users-header-bottom">
          <div className="filters">
            <button
              className={`filter-btn ${
                statusFilter === "all" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("all")}
            >
              {t("users.filter.all", "All")}
            </button>

            <button
              className={`filter-btn ${
                statusFilter === "Active" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("Active")}
            >
              {statusLabel("Active")}
            </button>

            <button
              className={`filter-btn ${
                statusFilter === "Inactive" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("Inactive")}
            >
              {statusLabel("Inactive")}
            </button>
          </div>

          <div className="users-header-right">
            <input
              type="text"
              placeholder={t(
                "users.searchPlaceholder",
                "Search user..."
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />

            <button
              className="add-user-btn"
              onClick={() => {
                setIsAdding(true);
                setIsEditing(false);
                setAddError("");
                setNewUserName("");
                setNewUserEmail("");
              }}
            >
              + {t("users.addUser", "Add user")}
            </button>
          </div>
        </div>
      </div>

      {/* ADD USER PANEL */}
      {isAdding && (
        <div className="add-user-panel">
          <div className="add-user-header">
            <h3>
              {t("users.newUserTitle", "New user")}
            </h3>
            <span className="add-user-subtitle">
              {t(
                "users.newUserSubtitle",
                "Fill in the details and save the user."
              )}
            </span>
          </div>

          <div className="add-user-grid">
            <input
              type="text"
              placeholder={t(
                "users.fullNamePlaceholder",
                "Full name"
              )}
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className={isNewNameInvalid ? "input-error" : ""}
            />
            <input
              type="email"
              placeholder={t(
                "users.emailPlaceholder",
                "Email"
              )}
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className={
                isNewEmailInvalid || isNewEmailDuplicate ? "input-error" : ""
              }
              required
            />

            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
            >
              <option value="User">{roleLabel("User")}</option>
              <option value="Admin">{roleLabel("Admin")}</option>
              <option value="Moderator">
                {roleLabel("Moderator")}
              </option>
            </select>

            <select
              value={newUserStatus}
              onChange={(e) => setNewUserStatus(e.target.value)}
            >
              <option value="Active">
                {statusLabel("Active")}
              </option>
              <option value="Inactive">
                {statusLabel("Inactive")}
              </option>
            </select>
          </div>

          {addError && <p className="add-user-error">{addError}</p>}

          <div className="add-user-actions">
            <button
              className="btn-primary"
              onClick={handleAddUser}
              disabled={isAddFormInvalid}
            >
              {t("users.addUser", "Add user")}
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                setIsAdding(false);
                setAddError("");
              }}
            >
              {t("common.cancel", "Cancel")}
            </button>
          </div>
        </div>
      )}

      {/* EDIT USER PANEL */}
      {isEditing && canEditUsers && (
        <div className="add-user-panel">
          <div className="add-user-header">
            <h3>
              {t("users.editUserTitle", "Edit user")}
            </h3>
            <span className="add-user-subtitle">
              {t(
                "users.editUserSubtitle",
                "Update the user information and save changes."
              )}
            </span>
          </div>

          <div className="add-user-grid">
            <input
              type="text"
              placeholder={t(
                "users.fullNamePlaceholder",
                "Full name"
              )}
              value={editUserName}
              onChange={(e) => setEditUserName(e.target.value)}
            />

            <input
              type="email"
              placeholder={t(
                "users.emailAddressPlaceholder",
                "Email address"
              )}
              value={editUserEmail}
              onChange={(e) => setEditUserEmail(e.target.value)}
            />

            <select
              value={editUserRole}
              onChange={(e) => setEditUserRole(e.target.value)}
            >
              <option value="User">{roleLabel("User")}</option>
              <option value="Admin">{roleLabel("Admin")}</option>
              <option value="Moderator">
                {roleLabel("Moderator")}
              </option>
            </select>

            <select
              value={editUserStatus}
              onChange={(e) => setEditUserStatus(e.target.value)}
            >
              <option value="Active">
                {statusLabel("Active")}
              </option>
              <option value="Inactive">
                {statusLabel("Inactive")}
              </option>
            </select>
          </div>

          <div className="add-user-actions">
            <button className="btn-primary" onClick={handleUpdateUser}>
              {t("common.save", "Save changes")}
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
              {t("common.cancel", "Cancel")}
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <table className="users-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("id")} className="sortable">
              ID {renderSortIndicator("id")}
            </th>
            <th onClick={() => handleSort("name")} className="sortable">
              {t("users.name", "Name")} {renderSortIndicator("name")}
            </th>
            <th onClick={() => handleSort("email")} className="sortable">
              {t("users.email", "Email")} {renderSortIndicator("email")}
            </th>
            <th onClick={() => handleSort("role")} className="sortable">
              {t("users.role", "Role")} {renderSortIndicator("role")}
            </th>
            <th onClick={() => handleSort("status")} className="sortable">
              {t("common.status", "Status")}{" "}
              {renderSortIndicator("status")}
            </th>
            <th>{t("common.actions", "Actions")}</th>
          </tr>
        </thead>

        <tbody>
          {sortedUsers.length === 0 ? (
            <tr>
              <td colSpan={6} className="empty-state">
                {t(
                  "users.emptyState",
                  "No users found for this filter."
                )}
              </td>
            </tr>
          ) : (
            sortedUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>

                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      {getInitials(user.name)}
                    </div>
                    <span className="user-name">{user.name}</span>
                  </div>
                </td>

                <td>{user.email}</td>

                <td>
                  <span
                    className={`role-badge role-${user.role.toLowerCase()}`}
                  >
                    {roleLabel(user.role)}
                  </span>
                </td>

                <td>
                  <span
                    className={`status-badge status-${user.status.toLowerCase()} ${
                      canToggleStatus ? "clickable" : ""
                    }`}
                    onClick={() => handleToggleStatus(user.id)}
                  >
                    {statusLabel(user.status)}
                  </span>
                </td>

                <td>
                  {canEditUsers && (
                    <button
                      className="edit-btn"
                      onClick={() => handleEditClick(user)}
                    >
                      {t("common.edit", "Edit")}
                    </button>
                  )}

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(user.id)}
                  >
                    {t("common.delete", "Delete")}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UsersPage;
