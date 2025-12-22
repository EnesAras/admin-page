// src/pages/UsersPage.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import "./UsersPage.css";
import { useSettings } from "../context/SettingsContext";
import translations from "../i18n/translations";
import { apiFetch } from "../lib/api";

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
  const t = useCallback(
    (key, fallback) => {
      if (dict && dict[key] !== undefined) return dict[key];
      if (translations.en && translations.en[key] !== undefined)
        return translations.en[key];
      if (fallback !== undefined) return fallback;
      return key;
    },
    [dict]
  );

 const roleLabel = (role) => {
  if (!role) return "";

  const r = role.toLowerCase();

  if (r === "admin") {
    return t("roleAdmin", "Admin");
  }
  if (r === "owner") {
    return t("roleOwner", "Owner");
  }
  if (r === "manager") {
    return t("roleManager", "Manager");
  }
  if (r === "moderator") {
    return t("roleModerator", "Moderator");
  }

  return t("roleUser", "User");
};


  const statusLabel = (status) => {
    if (!status) return "";
    let key = "statusActive";
    if (status === "Inactive") key = "statusInactive";
    return t(key, status);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // BACKEND USERS + loading/error
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // İlk açılışta backend'ten çek, hata olursa usersData'ya düş
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setFetchError("");
        const data = await apiFetch("/api/users");
        const normalized = Array.isArray(data)
          ? data
          : Array.isArray(data?.users)
            ? data.users
            : [];
        setUsers(normalized.length > 0 ? normalized : usersData);
      } catch (err) {
        console.error(err);
        setFetchError(
          t(
            "users.fetchError",
            "There was a problem loading users. Showing local data."
          )
        );
        setUsers(usersData);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [lang, t]);

  const CURRENT_USER_ROLE = "Admin";
  const canEditUsers = CURRENT_USER_ROLE === "Admin";
  const canToggleStatus =
    CURRENT_USER_ROLE === "Admin" || CURRENT_USER_ROLE === "Moderator";

  const [isAdding, setIsAdding] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [newUserStatus, setNewUserStatus] = useState("Active");
  const [addError, setAddError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState("user");
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

  // ========== ADD USER (backend + state) ==========
  const handleAddUser = async () => {
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

    const payload = {
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      status: newUserStatus,
      // country'yi istemiyorsan backend default "Unknown" kullanıyor zaten
    };

    try {
      const created = await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setUsers((prevUsers) => [...prevUsers, created]);

      setNewUserName("");
      setNewUserEmail("");
      setNewUserRole("user");
      setNewUserStatus("Active");
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      setAddError(
        t(
          "users.saveError",
          "There was a problem saving this user. Please try again."
        )
      );
    }
  };

  // ========== UPDATE USER (backend + state) ==========
  const handleUpdateUser = async () => {
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

    const payload = {
      name: editUserName.trim(),
      email: editUserEmail.trim(),
      role: editUserRole,
      status: editUserStatus,
    };

    try {
      const updated = await apiFetch(`/api/users/${editingUserId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === updated.id ? updated : user
        )
      );

      setIsEditing(false);
      setEditingUserId(null);
      setEditUserName("");
      setEditUserEmail("");
      setEditUserRole("user");
      setEditUserStatus("Active");
    } catch (err) {
      console.error(err);
      alert(
        t(
          "users.saveError",
          "There was a problem saving this user. Please try again."
        )
      );
    }
  };

  const handleEditClick = useCallback(
    (user) => {
      if (!canEditUsers) return;

      setIsAdding(false);
      setIsEditing(true);

      setEditingUserId(user.id);
      setEditUserName(user.name);
      setEditUserEmail(user.email);
      setEditUserRole(user.role);
      setEditUserStatus(user.status);
    },
    [canEditUsers]
  );

  // ========== TOGGLE STATUS (backend + state) ==========
  const handleToggleStatus = useCallback(
    async (id) => {
      if (!canToggleStatus) return;

      const user = users.find((u) => u.id === id);
      if (!user) return;

      const newStatus = user.status === "Active" ? "Inactive" : "Active";

      try {
        const updated = await apiFetch(`/api/users/${id}`, {
          method: "PUT",
          body: JSON.stringify({ status: newStatus }),
        });

        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === id ? updated : u))
        );
      } catch (err) {
        console.error(err);
        alert(
          t(
            "users.toggleError",
            "There was a problem updating the status."
          )
        );
      }
    },
    [canToggleStatus, t, users]
  );

  // ========== DELETE (backend + state) ==========
  const handleDelete = useCallback(
    async (id) => {
      try {
        await apiFetch(`/api/users/${id}`, {
          method: "DELETE",
        });

        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      } catch (err) {
        console.error(err);
        alert(
          t(
            "users.deleteError",
            "There was a problem deleting this user."
          )
        );
      }
    },
    [t]
  );

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
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
  }, [filteredUsers, sortBy, sortDirection]);

  const handleSort = useCallback((column) => {
    setSortBy((prevSortBy) => {
      if (prevSortBy === column) {
        setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevSortBy;
      }
      setSortDirection("asc");
      return column;
    });
  }, []);

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

      {/* LOADING / ERROR */}
      {loading && (
        <div className="users-loading">
          {t("users.loading", "Loading users...")}
        </div>
      )}
      {fetchError && !loading && (
        <div className="users-error-fetch">{fetchError}</div>
      )}

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
  <option value="user">{roleLabel("user")}</option>
  <option value="admin">{roleLabel("admin")}</option>
  <option value="manager">{roleLabel("manager")}</option>
  <option value="owner">{roleLabel("owner")}</option>
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
  <option value="user">{roleLabel("user")}</option>
  <option value="admin">{roleLabel("admin")}</option>
  <option value="manager">{roleLabel("manager")}</option>
  <option value="owner">{roleLabel("owner")}</option>
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
          {sortedUsers.length === 0 && !loading ? (
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
