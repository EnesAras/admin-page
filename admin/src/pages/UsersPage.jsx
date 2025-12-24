// src/pages/UsersPage.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import "./UsersPage.css";
import { useSettings } from "../context/SettingsContext";
import translations from "../i18n/translations";
import { apiFetch, emitApiToast } from "../lib/api";
import EmptyState from "../components/EmptyState";
import Skeleton from "../components/Skeleton";
import { useAuth } from "../context/AuthContext";

const normalize = (value) => String(value ?? "").toLowerCase().trim();

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
  const { currentUser, hasRole } = useAuth();

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // BACKEND USERS + loading/error
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // İlk açılışta backend'ten çek, hata olursa usersData'ya düş
  const fetchUsers = useCallback(async () => {
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
  }, [lang, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const formatApiError = useCallback(
    (err, fallbackKey, statusKey, fallbackDefault) => {
      const status = err?.status;
      const fallbackText = t(
        fallbackKey,
        fallbackDefault || "Unable to complete this action."
      );
      const backendMsg =
        err?.data?.error || err?.message || fallbackText;
      const toastMessage = status
        ? t(
            statusKey,
            "Unable to complete this action ({status}): {message}"
          )
            .replace("{status}", String(status))
            .replace("{message}", backendMsg)
        : backendMsg;
      emitApiToast({
        type: "error",
        message: toastMessage,
      });
      return backendMsg;
    },
    [t]
  );

  const currentRole = (currentUser?.role || "").toLowerCase();
  const canCreateUser = hasRole(["admin", "owner"]);
  const canEditUsers = hasRole(["admin", "owner"]);
  const canToggleStatus = ["admin", "owner", "moderator"].includes(
    currentRole
  );
  const [presenceMap, setPresenceMap] = useState(new Map());

  const loadPresenceData = useCallback(async () => {
    if (!canEditUsers) {
      setPresenceMap(new Map());
      return;
    }

    try {
      const response = await apiFetch("/api/presence/users");
      const map = new Map();
      (response?.users || []).forEach((user) => {
        const userId = Number(user?.id);
        if (Number.isFinite(userId)) {
          map.set(userId, user.presence || null);
        }
      });
      setPresenceMap(map);
    } catch (err) {
      console.error("Presence fetch failed:", err);
    }
  }, [canEditUsers]);

  useEffect(() => {
    loadPresenceData();
  }, [loadPresenceData]);

  const [isAdding, setIsAdding] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [newUserStatus, setNewUserStatus] = useState("Active");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserPasswordConfirm, setNewUserPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [addError, setAddError] = useState("");

  const resetAddForm = useCallback(() => {
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("user");
    setNewUserStatus("Active");
    setNewUserPassword("");
    setNewUserPasswordConfirm("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const resetEditForm = useCallback(() => {
    setEditUserName("");
    setEditUserEmail("");
    setEditUserRole("user");
    setEditUserStatus("Active");
    setEditNewPassword("");
    setEditConfirmPassword("");
    setShowEditPassword(false);
    setShowEditConfirmPassword(false);
    setEditError("");
  }, []);

  useEffect(() => {
    if (!canCreateUser && isAdding) {
      resetAddForm();
      setAddError("");
      setIsAdding(false);
    }
  }, [canCreateUser, isAdding, resetAddForm]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState("user");
  const [editUserStatus, setEditUserStatus] = useState("Active");
  const [editNewPassword, setEditNewPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);
  const [editError, setEditError] = useState("");

  const openAddPanel = useCallback(() => {
    resetAddForm();
    setAddError("");
    setIsEditing(false);
    setIsAdding(true);
  }, [resetAddForm]);

  const openEditPanel = useCallback((user) => {
    setIsAdding(false);
    setIsEditing(true);
    setEditingUserId(user.id);
    setEditUserName(user.name || "");
    setEditUserEmail(user.email || "");
    setEditUserRole(user.role || "user");
    setEditUserStatus(user.status || "Active");
    setEditNewPassword("");
    setEditConfirmPassword("");
    setShowEditPassword(false);
    setShowEditConfirmPassword(false);
    setEditError("");
  }, []);

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
  const isPasswordTooShort =
    newUserPassword.trim() !== "" && newUserPassword.length < 8;
  const isPasswordMismatch =
    newUserPassword &&
    newUserPasswordConfirm &&
    newUserPassword !== newUserPasswordConfirm;

  const isAddFormInvalid =
    !newUserName.trim() ||
    !newUserEmail.trim() ||
    !newUserPassword ||
    !newUserPasswordConfirm ||
    isNewNameInvalid ||
    isNewEmailInvalid ||
    isNewEmailDuplicate ||
    isPasswordTooShort ||
    isPasswordMismatch;

  const validationMessages = [];
  if (!newUserName.trim()) {
    validationMessages.push(
      t("users.error.nameRequired", "Name and email are required.")
    );
  }
  if (!newUserEmail.trim() || isNewEmailInvalid) {
    validationMessages.push(
      t("users.error.emailInvalid", "Please enter a valid email address.")
    );
  }
  if (isNewEmailDuplicate) {
    validationMessages.push(
      t("users.error.emailExists", "This email is already registered.")
    );
  }
  if (isNewNameInvalid) {
    validationMessages.push(
      t(
        "users.error.nameLettersOnly",
        "Name can only contain letters and spaces."
      )
    );
  }
  if (isPasswordTooShort) {
    validationMessages.push(
      t(
        "users.passwordTooShort",
        "Password must be at least 8 characters."
      )
    );
  }
  if (isPasswordMismatch) {
    validationMessages.push(
      t("users.passwordMismatch", "Passwords must match.")
    );
  }

  const isEditNameInvalid =
    editUserName.trim() !== "" && !isValidName(editUserName);
  const isEditEmailInvalid =
    editUserEmail.trim() !== "" && !isValidEmail(editUserEmail);
  const isEditEmailDuplicate =
    editUserEmail.trim() !== "" &&
    users.some(
      (u) =>
        u.id !== editingUserId &&
        u.email.toLowerCase() === editUserEmail.trim().toLowerCase()
    );
  const isEditPasswordTooShort =
    editNewPassword.trim() !== "" && editNewPassword.length < 8;
  const isEditPasswordMismatch =
    editNewPassword &&
    editConfirmPassword &&
    editNewPassword !== editConfirmPassword;

  const isEditFormInvalid =
    !editUserName.trim() ||
    !editUserEmail.trim() ||
    isEditNameInvalid ||
    isEditEmailInvalid ||
    isEditEmailDuplicate ||
    isEditPasswordTooShort ||
    isEditPasswordMismatch;

  const editValidationMessages = [];
  if (!editUserName.trim()) {
    editValidationMessages.push(
      t("users.error.nameRequired", "Name and email are required.")
    );
  }
  if (!editUserEmail.trim() || isEditEmailInvalid) {
    editValidationMessages.push(
      t("users.error.emailInvalid", "Please enter a valid email address.")
    );
  }
  if (isEditEmailDuplicate) {
    editValidationMessages.push(
      t("users.error.emailUsed", "This email is already registered for another user.")
    );
  }
  if (isEditNameInvalid) {
    editValidationMessages.push(
      t(
        "users.error.nameLettersOnly",
        "Name can only contain letters and spaces."
      )
    );
  }
  if (isEditPasswordTooShort) {
    editValidationMessages.push(
      t(
        "users.passwordTooShort",
        "Password must be at least 8 characters."
      )
    );
  }
  if (isEditPasswordMismatch) {
    editValidationMessages.push(
      t("users.passwordMismatch", "Passwords must match.")
    );
  }

  // ========== ADD USER (backend + state) ==========
  const handleAddUser = async () => {
    setAddError("");

    if (!canCreateUser) {
      emitApiToast({
        type: "error",
        message: t("users.notAuthorized", "Not authorized"),
      });
      return;
    }

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

    if (isPasswordTooShort) {
      setAddError(
        t(
          "users.passwordTooShort",
          "Password must be at least 8 characters."
        )
      );
      return;
    }

    if (isPasswordMismatch) {
      setAddError(
        t("users.passwordMismatch", "Passwords must match.")
      );
      return;
    }

    const payload = {
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      status: newUserStatus,
      password: newUserPassword.trim(),
    };

    console.log("Creating user payload:", {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      status: payload.status,
      passwordLength: payload.password.length,
    });

    try {
      await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      emitApiToast({
        type: "success",
        message: t("users.createSuccess", "User created"),
      });

      await fetchUsers();
      await loadPresenceData();
      await loadPresenceData();

      setAddError("");
      resetAddForm();
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      const backendMsg = formatApiError(
        err,
        "users.createFailed",
        "users.createFailedStatus",
        "There was a problem saving this user. Please try again."
      );
      setAddError(backendMsg);
    }
  };

  // ========== UPDATE USER (backend + state) ==========
  const handleUpdateUser = async () => {
    if (!canEditUsers) return;

    if (isEditFormInvalid) {
      setEditError(editValidationMessages[0] || "");
      return;
    }

    if (!editingUserId) return;

    const payload = {
      name: editUserName.trim(),
      email: editUserEmail.trim(),
      role: editUserRole,
      status: editUserStatus,
    };
    if (editNewPassword.trim()) {
      payload.password = editNewPassword.trim();
    }

    try {
      await apiFetch(`/api/users/${editingUserId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      emitApiToast({
        type: "success",
        message: t("users.updateSuccess", "User updated"),
      });

      await fetchUsers();

      setIsEditing(false);
      setEditingUserId(null);
      resetEditForm();
    } catch (err) {
      console.error(err);
      const backendMsg = formatApiError(
        err,
        "users.updateFailed",
        "users.updateFailedStatus",
        "There was a problem updating this user. Please try again."
      );
      setEditError(backendMsg);
    }
  };

  const handleEditClick = useCallback(
    (user) => {
      if (!canEditUsers) return;
      openEditPanel(user);
    },
    [canEditUsers, openEditPanel]
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
    const query = normalize(searchTerm);

    return users.filter((user) => {
      const matchesStatus =
        statusFilter === "all" ||
        normalize(user.status) === normalize(statusFilter);

      const matchesSearch =
        !query ||
        [user.name, user.email, user.role, user.status].some((field) =>
          normalize(field).includes(query)
        );

      return matchesStatus && matchesSearch;
    });
  }, [users, searchTerm, statusFilter]);

  const sortedUsers = useMemo(() => {
    const resolveValue = (user) => {
      switch (sortBy) {
        case "name":
          return normalize(user.name);
        case "email":
          return normalize(user.email);
        case "role":
          return normalize(user.role);
        case "status":
          return normalize(user.status);
        case "createdAt": {
          const timestamp = new Date(
            user.createdAt || user.created_at || ""
          ).getTime();
          return Number.isNaN(timestamp) ? 0 : timestamp;
        }
        default:
          return Number.isFinite(Number(user.id)) ? Number(user.id) : 0;
      }
    };

    return [...filteredUsers].sort((a, b) => {
      const valA = resolveValue(a);
      const valB = resolveValue(b);

      if (typeof valA === "string" && typeof valB === "string") {
        const cmp = valA.localeCompare(valB);
        return sortDirection === "asc" ? cmp : -cmp;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortBy, sortDirection]);

  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setPage((current) => {
      const next = Math.min(Math.max(current, 1), totalPages);
      return next;
    });
  }, [totalPages]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, page, pageSize]);

  const handleSort = useCallback((column) => {
    setPage(1);
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

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setPage(1);
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  const rangeStart =
    totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd =
    totalItems === 0 ? 0 : Math.min(totalItems, page * pageSize);

  const showingText = t(
    "users.showingRange",
    "Showing {start}-{end} of {total}"
  )
    .replace("{start}", String(rangeStart))
    .replace("{end}", String(rangeEnd))
    .replace("{total}", String(totalItems));

  const pageIndicator = `${t("users.pageIndicator", "Page")} ${page} ${t(
    "common.of",
    "of"
  )} ${totalPages}`;

  const skeletonRows = Math.min(pageSize, 8);
  const emptyTitle = t(
    "users.emptyState",
    "No users found for this filter."
  );
  const emptyDescription = t(
    "users.emptyStateDesc",
    "Try changing search or filters."
  );

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

  const formatDate = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString();
  };

  const formatPresenceTimestamp = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleString();
  };

  const formatPresenceTooltipTime = (value) => {
    const formatted = formatPresenceTimestamp(value);
    return formatted && formatted !== "-" ? formatted : null;
  };

  const buildPresenceTooltip = (presence) => {
    if (!presence) {
      return t(
        "presence.tooltipUnknown",
        "{status} • {noSessionYet}"
      )
        .replace("{status}", t("presence.unknown", "Unknown"))
        .replace(
          "{noSessionYet}",
          t("presence.noSessionYet", "No session recorded yet")
        );
    }
    const statusLabel = presence?.online
      ? t("presence.online", "Online")
      : t("presence.offline", "Offline");
    const parts = [statusLabel];

    if (presence?.online) {
      const loggedIn = formatPresenceTooltipTime(presence.lastLoginAt);
      if (loggedIn) {
        parts.push(
          t("presence.loggedInAt", "Logged in at {time}").replace(
            "{time}",
            loggedIn
          )
        );
      }
      const lastSeen =
        formatPresenceTooltipTime(presence.lastSeenAt || presence.lastLoginAt);
      if (lastSeen) {
        parts.push(
          t("presence.lastSeen", "Last seen {time}").replace(
            "{time}",
            lastSeen
          )
        );
      }
    } else {
      const lastLogout = formatPresenceTooltipTime(presence.lastLogoutAt);
      if (lastLogout) {
        parts.push(
          t("presence.lastLogout", "Last logout: {time}").replace(
            "{time}",
            lastLogout
          )
        );
      }
    }
    return parts.join(" • ");
  };

  return (
    <div className="users-container">
      {/* HEADER */}
      <div className="users-page-header page-header">
        <div className="page-header-main">
          <span className="page-header-icon" aria-hidden="true">
            👥
          </span>
          <div>
            <p className="page-header-title">
              {t("users.title", "Users")}
            </p>
            <span className="page-header-caption">
              {t("users.pageCaption", "Manage team access and roles")}
            </span>
          </div>
        </div>
      </div>

        <div className="users-toolbar">
          <div className="users-toolbar-row users-toolbar-row-top">
            <div className="users-toolbar-row-left">
              <div className="filters">
                <button
                  className={`filter-btn ${
                    statusFilter === "all" ? "active" : ""
                  }`}
                  onClick={() => handleStatusFilterChange("all")}
                >
                  {t("users.filter.all", "All")}
                </button>

                <button
                  className={`filter-btn ${
                    statusFilter === "Active" ? "active" : ""
                  }`}
                  onClick={() => handleStatusFilterChange("Active")}
                >
                  {statusLabel("Active")}
                </button>

                <button
                  className={`filter-btn ${
                    statusFilter === "Inactive" ? "active" : ""
                  }`}
                  onClick={() => handleStatusFilterChange("Inactive")}
                >
                  {statusLabel("Inactive")}
                </button>
              </div>
              <div className="users-search">
                <input
                  type="text"
                  placeholder={t("users.searchPlaceholder", "Search users...")}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

              <div className="users-toolbar-row-right">
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
              {canCreateUser && (
                <button
                  className="add-user-btn secondary"
                  type="button"
                  onClick={openAddPanel}
                >
                  + {t("users.addUser", "Add user")}
                </button>
              )}
            </div>
          </div>

          <div className="users-toolbar-row users-toolbar-row-bottom">
            <div className="users-pageSize">
              <label htmlFor="users-page-size">
                {t("users.pageSizeLabel", "Rows")}
              </label>
              <select
                id="users-page-size"
                value={pageSize}
                onChange={(e) =>
                  handlePageSizeChange(Number(e.target.value))
                }
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="users-toolbar-row-bottom-right">
              <div className="users-pagination">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={page <= 1}
                >
                  Prev
                </button>
                <span>{pageIndicator}</span>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={page >= totalPages}
                >
                  Next
                </button>
              </div>
              <div className="users-pagination-info">{showingText}</div>
            </div>
          </div>
        </div>

      {/* LOADING / ERROR */}
      {fetchError && !loading && (
        <div className="users-error-fetch">{fetchError}</div>
      )}

      {/* ADD USER PANEL */}
      {isAdding && canCreateUser && (
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

            {canCreateUser && (
              <>
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("users.password", "Password")}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className={isPasswordTooShort ? "input-error" : ""}
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={
                      showPassword
                        ? t("users.hidePassword", "Hide password")
                        : t("users.showPassword", "Show password")
                    }
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="password-field">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("users.confirmPassword", "Confirm password")}
                    value={newUserPasswordConfirm}
                    onChange={(e) => setNewUserPasswordConfirm(e.target.value)}
                    className={isPasswordMismatch ? "input-error" : ""}
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={
                      showConfirmPassword
                        ? t("users.hidePassword", "Hide password")
                        : t("users.showPassword", "Show password")
                    }
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </>
            )}

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

          {(addError || (isAddFormInvalid && validationMessages.length > 0)) && (
            <div className="add-user-error">
              {addError && <p>{addError}</p>}
              {isAddFormInvalid && validationMessages.length > 0 && (
                <ul className="validation-list">
                  {validationMessages.map((message, index) => (
                    <li key={`validation-${index}`}>{message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

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
              type="button"
              onClick={() => {
                resetAddForm();
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

            <div className="reset-password-block">
              <span className="reset-password-title">
                {t("users.resetPasswordTitle", "Reset password")}
              </span>
              <div className="password-field">
                <input
                  type={showEditPassword ? "text" : "password"}
                  placeholder={t("users.newPassword", "New password")}
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  className={
                    isEditPasswordTooShort ? "input-error" : ""
                  }
                  minLength={8}
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    showEditPassword
                      ? t("users.hidePassword", "Hide password")
                      : t("users.showPassword", "Show password")
                  }
                  onClick={() => setShowEditPassword((prev) => !prev)}
                >
                  {showEditPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="password-field">
                <input
                  type={showEditConfirmPassword ? "text" : "password"}
                  placeholder={t("users.confirmPassword", "Confirm password")}
                  value={editConfirmPassword}
                  onChange={(e) => setEditConfirmPassword(e.target.value)}
                  className={isEditPasswordMismatch ? "input-error" : ""}
                  minLength={8}
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    showEditConfirmPassword
                      ? t("users.hidePassword", "Hide password")
                      : t("users.showPassword", "Show password")
                  }
                  onClick={() =>
                    setShowEditConfirmPassword((prev) => !prev)
                  }
                >
                  {showEditConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          {(editError ||
            (isEditFormInvalid && editValidationMessages.length > 0)) && (
            <div className="add-user-error">
              {editError && <p>{editError}</p>}
              {isEditFormInvalid && editValidationMessages.length > 0 && (
                <ul className="validation-list">
                  {editValidationMessages.map((message, index) => (
                    <li key={`edit-validation-${index}`}>{message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="add-user-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={handleUpdateUser}
            >
              {t("users.saveChanges", "Save changes")}
            </button>
            <button
              className="btn-ghost"
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditingUserId(null);
                resetEditForm();
              }}
            >
              {t("users.cancel", "Cancel")}
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
                {t("common.status", "Status")} {renderSortIndicator("status")}
              </th>
              <th onClick={() => handleSort("createdAt")} className="sortable">
                {t("users.createdAt", "Created")}{" "}
                {renderSortIndicator("createdAt")}
              </th>
              {canEditUsers && (
                <th>{t("presence.column", "Presence")}</th>
              )}
              <th>{t("common.actions", "Actions")}</th>
            </tr>
        </thead>

        <tbody>
          {loading ? (
            <Skeleton
              rows={skeletonRows}
              columns={canEditUsers ? 8 : 7}
            />
          ) : (
            paginatedUsers.map((user) => {
              const userPresenceId = Number(user.id);
              const presence = Number.isFinite(userPresenceId)
                ? presenceMap.get(userPresenceId)
                : null;
              const hasPresenceRecord = presence != null;
              const presenceLabel = hasPresenceRecord
                ? presence?.online
                  ? t("presence.online", "Online")
                  : t("presence.offline", "Offline")
                : t("presence.unknown", "Unknown");
              const presenceTooltip = hasPresenceRecord
                ? buildPresenceTooltip(presence)
                : "";

              return (
                <tr key={user.id}>
                  <td>{user.id}</td>

                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{getInitials(user.name)}</div>
                      <span className="user-name">{user.name}</span>
                    </div>
                  </td>

                  <td>{user.email}</td>

                  <td>
                    <span
                      className={`role-badge role-${normalize(user.role)}`}
                    >
                      {roleLabel(user.role)}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status-badge status-${normalize(user.status)} ${
                        canToggleStatus ? "clickable" : ""
                      }`}
                      onClick={() => handleToggleStatus(user.id)}
                    >
                      {statusLabel(user.status)}
                    </span>
                  </td>

                  <td>{formatDate(user.createdAt || user.created_at)}</td>

                  {canEditUsers && (
                    <td className="presence-cell">
                      <span
                        className={`presence-badge ${
                          presence?.online
                            ? "online"
                            : hasPresenceRecord
                            ? "offline"
                            : "unknown"
                        }`}
                        title={presenceTooltip || undefined}
                      >
                        {presenceLabel}
                      </span>
                    </td>
                  )}

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
              );
            })
          )}
        </tbody>
      </table>

      {!loading && totalItems === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </div>
  );
}

export default UsersPage;
