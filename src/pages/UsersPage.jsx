// src/pages/UsersPage.jsx
import { useState, useEffect } from "react";
import "./UsersPage.css";
import { useSettings } from "../context/SettingsContext";

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

// Çok dilli textler
const userTexts = {
  en: {
    title: "Users",
    filterAll: "All",
    searchPlaceholder: "Search user...",
    newUserTitle: "New User",
    newUserSubtitle: "Fill in the details and save the user.",
    editUserTitle: "Edit User",
    editUserSubtitle: "Update the user information and save changes.",
    fullNamePlaceholder: "Full name",
    emailPlaceholder: "Email",
    emailAddressPlaceholder: "Email address",
    addUserButton: "Add User",
    cancelButton: "Cancel",
    saveChangesButton: "Save Changes",
    editButton: "Edit",
    deleteButton: "Delete",
    nameRequired: "Name and email are required.",
    nameLettersOnly: "Name can only contain letters and spaces.",
    emailInvalid: "Please enter a valid email address.",
    emailExists: "This email is already registered.",
    emailUsed: "This email is already registered for another user.",
    roleColumn: "Role",
    statusColumn: "Status",
    actionsColumn: "Actions",
  },
  tr: {
    title: "Kullanıcılar",
    filterAll: "Hepsi",
    searchPlaceholder: "Kullanıcı ara...",
    newUserTitle: "Yeni Kullanıcı",
    newUserSubtitle: "Bilgileri doldur ve kaydet.",
    editUserTitle: "Kullanıcıyı Düzenle",
    editUserSubtitle: "Kullanıcı bilgilerini güncelle ve kaydet.",
    fullNamePlaceholder: "Ad Soyad",
    emailPlaceholder: "E-posta",
    emailAddressPlaceholder: "E-posta adresi",
    addUserButton: "Kullanıcı Ekle",
    cancelButton: "İptal",
    saveChangesButton: "Değişiklikleri Kaydet",
    editButton: "Düzenle",
    deleteButton: "Sil",
    nameRequired: "İsim ve e-posta zorunludur.",
    nameLettersOnly: "İsim sadece harf ve boşluk içerebilir.",
    emailInvalid: "Lütfen geçerli bir e-posta adresi gir.",
    emailExists: "Bu e-posta zaten kayıtlı.",
    emailUsed: "Bu e-posta başka bir kullanıcıda kayıtlı.",
    roleColumn: "Rol",
    statusColumn: "Durum",
    actionsColumn: "İşlemler",
  },
  es: {
    title: "Usuarios",
    filterAll: "Todos",
    searchPlaceholder: "Buscar usuario...",
    newUserTitle: "Nuevo usuario",
    newUserSubtitle: "Rellena los datos y guarda el usuario.",
    editUserTitle: "Editar usuario",
    editUserSubtitle: "Actualiza la información del usuario y guarda.",
    fullNamePlaceholder: "Nombre completo",
    emailPlaceholder: "Correo",
    emailAddressPlaceholder: "Correo electrónico",
    addUserButton: "Añadir usuario",
    cancelButton: "Cancelar",
    saveChangesButton: "Guardar cambios",
    editButton: "Editar",
    deleteButton: "Eliminar",
    nameRequired: "Nombre y correo son obligatorios.",
    nameLettersOnly: "El nombre solo puede contener letras y espacios.",
    emailInvalid: "Introduce un correo válido.",
    emailExists: "Este correo ya está registrado.",
    emailUsed: "Este correo ya está registrado en otro usuario.",
    roleColumn: "Rol",
    statusColumn: "Estado",
    actionsColumn: "Acciones",
  },
  de: {
    title: "Benutzer",
    filterAll: "Alle",
    searchPlaceholder: "Benutzer suchen...",
    newUserTitle: "Neuer Benutzer",
    newUserSubtitle: "Daten ausfüllen und Benutzer speichern.",
    editUserTitle: "Benutzer bearbeiten",
    editUserSubtitle: "Benutzerdaten aktualisieren und speichern.",
    fullNamePlaceholder: "Vollständiger Name",
    emailPlaceholder: "E-Mail",
    emailAddressPlaceholder: "E-Mail-Adresse",
    addUserButton: "Benutzer hinzufügen",
    cancelButton: "Abbrechen",
    saveChangesButton: "Änderungen speichern",
    editButton: "Bearbeiten",
    deleteButton: "Löschen",
    nameRequired: "Name und E-Mail sind erforderlich.",
    nameLettersOnly: "Name darf nur Buchstaben und Leerzeichen enthalten.",
    emailInvalid: "Bitte eine gültige E-Mail-Adresse eingeben.",
    emailExists: "Diese E-Mail ist bereits registriert.",
    emailUsed:
      "Diese E-Mail wird bereits von einem anderen Benutzer verwendet.",
    roleColumn: "Rolle",
    statusColumn: "Status",
    actionsColumn: "Aktionen",
  },
  fr: {
    title: "Utilisateurs",
    filterAll: "Tous",
    searchPlaceholder: "Rechercher un utilisateur...",
    newUserTitle: "Nouvel utilisateur",
    newUserSubtitle: "Renseigne les informations et enregistre.",
    editUserTitle: "Modifier l'utilisateur",
    editUserSubtitle:
      "Mets à jour les informations de l'utilisateur et enregistre.",
    fullNamePlaceholder: "Nom complet",
    emailPlaceholder: "E-mail",
    emailAddressPlaceholder: "Adresse e-mail",
    addUserButton: "Ajouter un utilisateur",
    cancelButton: "Annuler",
    saveChangesButton: "Enregistrer les modifications",
    editButton: "Modifier",
    deleteButton: "Supprimer",
    nameRequired: "Le nom et l'e-mail sont obligatoires.",
    nameLettersOnly: "Le nom ne peut contenir que des lettres et des espaces.",
    emailInvalid: "Merci d'entrer une adresse e-mail valide.",
    emailExists: "Cet e-mail est déjà enregistré.",
    emailUsed: "Cet e-mail est déjà utilisé par un autre utilisateur.",
    roleColumn: "Rôle",
    statusColumn: "Statut",
    actionsColumn: "Actions",
  },
  it: {
    title: "Utenti",
    filterAll: "Tutti",
    searchPlaceholder: "Cerca utente...",
    newUserTitle: "Nuovo utente",
    newUserSubtitle: "Compila i dati e salva l'utente.",
    editUserTitle: "Modifica utente",
    editUserSubtitle:
      "Aggiorna le informazioni dell'utente e salva le modifiche.",
    fullNamePlaceholder: "Nome completo",
    emailPlaceholder: "Email",
    emailAddressPlaceholder: "Indirizzo email",
    addUserButton: "Aggiungi utente",
    cancelButton: "Annulla",
    saveChangesButton: "Salva modifiche",
    editButton: "Modifica",
    deleteButton: "Elimina",
    nameRequired: "Nome ed email sono obbligatori.",
    nameLettersOnly: "Il nome può contenere solo lettere e spazi.",
    emailInvalid: "Inserisci un indirizzo email valido.",
    emailExists: "Questa email è già registrata.",
    emailUsed: "Questa email è già registrata per un altro utente.",
    roleColumn: "Ruolo",
    statusColumn: "Stato",
    actionsColumn: "Azioni",
  },
  ru: {
    title: "Пользователи",
    filterAll: "Все",
    searchPlaceholder: "Поиск пользователя...",
    newUserTitle: "Новый пользователь",
    newUserSubtitle: "Заполните данные и сохраните пользователя.",
    editUserTitle: "Редактировать пользователя",
    editUserSubtitle:
      "Обновите информацию о пользователе и сохраните изменения.",
    fullNamePlaceholder: "Полное имя",
    emailPlaceholder: "E-mail",
    emailAddressPlaceholder: "Адрес e-mail",
    addUserButton: "Добавить пользователя",
    cancelButton: "Отмена",
    saveChangesButton: "Сохранить изменения",
    editButton: "Редактировать",
    deleteButton: "Удалить",
    nameRequired: "Имя и e-mail обязательны.",
    nameLettersOnly: "Имя может содержать только буквы и пробелы.",
    emailInvalid: "Пожалуйста, введите корректный адрес e-mail.",
    emailExists: "Этот e-mail уже зарегистрирован.",
    emailUsed: "Этот e-mail уже используется другим пользователем.",
    roleColumn: "Роль",
    statusColumn: "Статус",
    actionsColumn: "Действия",
  },
};

const statusLabels = {
  en: { Active: "Active", Inactive: "Inactive", Pending: "Pending" },
  tr: { Active: "Aktif", Inactive: "Pasif", Pending: "Beklemede" },
  es: { Active: "Activo", Inactive: "Inactivo", Pending: "Pendiente" },
  de: { Active: "Aktiv", Inactive: "Inaktiv", Pending: "Ausstehend" },
  fr: { Active: "Actif", Inactive: "Inactif", Pending: "En attente" },
  it: { Active: "Attivo", Inactive: "Inattivo", Pending: "In sospeso" },
  ru: { Active: "Активен", Inactive: "Неактивен", Pending: "В ожидании" },
};

const roleLabels = {
  en: { Admin: "Admin", User: "User", Moderator: "Moderator" },
  tr: { Admin: "Yönetici", User: "Kullanıcı", Moderator: "Moderatör" },
  es: { Admin: "Administrador", User: "Usuario", Moderator: "Moderador" },
  de: { Admin: "Administrator", User: "Benutzer", Moderator: "Moderator" },
  fr: { Admin: "Admin", User: "Utilisateur", Moderator: "Modérateur" },
  it: { Admin: "Admin", User: "Utente", Moderator: "Moderatore" },
  ru: { Admin: "Админ", User: "Пользователь", Moderator: "Модератор" },
};

function UsersPage({ language }) {
  const { settings, language: ctxLanguage } = useSettings();

  // Dil öncelik sırası: prop > context.language > settings.language > "en"
  const lang = language || ctxLanguage || settings?.language || "en";

  const t = userTexts[lang] || userTexts.en;
  const s = statusLabels[lang] || statusLabels.en;
  const r = roleLabels[lang] || roleLabels.en;

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
      setAddError(t.nameRequired);
      return;
    }

    if (!isValidName(newUserName)) {
      setAddError(t.nameLettersOnly);
      return;
    }

    if (!isValidEmail(newUserEmail)) {
      setAddError(t.emailInvalid);
      return;
    }

    const emailExists = users.some(
      (u) => u.email.toLowerCase() === newUserEmail.trim().toLowerCase()
    );
    if (emailExists) {
      setAddError(t.emailExists);
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
      alert(t.nameRequired);
      return;
    }

    if (!isValidName(editUserName)) {
      alert(t.nameLettersOnly);
      return;
    }

    if (!isValidEmail(editUserEmail)) {
      alert(t.emailInvalid);
      return;
    }

    const emailTaken = users.some(
      (u) =>
        u.id !== editingUserId &&
        u.email.toLowerCase() === editUserEmail.trim().toLowerCase()
    );

    if (emailTaken) {
      alert(t.emailUsed);
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

  const handleDelete = (id) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <h2>{t.title}</h2>

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
          + {t.addUserButton}
        </button>

        <div className="filters">
          <button
            className={`filter-btn ${
              statusFilter === "all" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("all")}
          >
            {t.filterAll}
          </button>

          <button
            className={`filter-btn ${
              statusFilter === "Active" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("Active")}
          >
            {s.Active}
          </button>

          <button
            className={`filter-btn ${
              statusFilter === "Inactive" ? "active" : ""
            }`}
            onClick={() => setStatusFilter("Inactive")}
          >
            {s.Inactive}
          </button>
        </div>

        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {isAdding && (
        <div className="add-user-panel">
          <div className="add-user-header">
            <h3>{t.newUserTitle}</h3>
            <span className="add-user-subtitle">{t.newUserSubtitle}</span>
          </div>

          <div className="add-user-grid">
            <input
              type="text"
              placeholder={t.fullNamePlaceholder}
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className={isNewNameInvalid ? "input-error" : ""}
            />
            <input
              type="email"
              placeholder={t.emailPlaceholder}
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
              <option value="User">{r.User}</option>
              <option value="Admin">{r.Admin}</option>
              <option value="Moderator">{r.Moderator}</option>
            </select>

            <select
              value={newUserStatus}
              onChange={(e) => setNewUserStatus(e.target.value)}
            >
              <option value="Active">{s.Active}</option>
              <option value="Inactive">{s.Inactive}</option>
            </select>
          </div>

          {addError && <p className="add-user-error">{addError}</p>}

          <div className="add-user-actions">
            <button
              className="btn-primary"
              onClick={handleAddUser}
              disabled={isAddFormInvalid}
            >
              {t.addUserButton}
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                setIsAdding(false);
                setAddError("");
              }}
            >
              {t.cancelButton}
            </button>
          </div>
        </div>
      )}

      {isEditing && canEditUsers && (
        <div className="add-user-panel">
          <div className="add-user-header">
            <h3>{t.editUserTitle}</h3>
            <span className="add-user-subtitle">{t.editUserSubtitle}</span>
          </div>

          <div className="add-user-grid">
            <input
              type="text"
              placeholder={t.fullNamePlaceholder}
              value={editUserName}
              onChange={(e) => setEditUserName(e.target.value)}
            />

            <input
              type="email"
              placeholder={t.emailAddressPlaceholder}
              value={editUserEmail}
              onChange={(e) => setEditUserEmail(e.target.value)}
            />

            <select
              value={editUserRole}
              onChange={(e) => setEditUserRole(e.target.value)}
            >
              <option value="User">{r.User}</option>
              <option value="Admin">{r.Admin}</option>
              <option value="Moderator">{r.Moderator}</option>
            </select>

            <select
              value={editUserStatus}
              onChange={(e) => setEditUserStatus(e.target.value)}
            >
              <option value="Active">{s.Active}</option>
              <option value="Inactive">{s.Inactive}</option>
            </select>
          </div>

          <div className="add-user-actions">
            <button className="btn-primary" onClick={handleUpdateUser}>
              {t.saveChangesButton}
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
              {t.cancelButton}
            </button>
          </div>
        </div>
      )}

      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>{t.fullNamePlaceholder}</th>
            <th>{t.emailPlaceholder}</th>
            <th>{t.roleColumn}</th>
            <th>{t.statusColumn}</th>
            <th>{t.actionsColumn}</th>
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
                  {r[user.role] || user.role}
                </span>
              </td>

              <td>
                <span
                  className={`status-badge status-${user.status.toLowerCase()} ${
                    canToggleStatus ? "clickable" : ""
                  }`}
                  onClick={() => handleToggleStatus(user.id)}
                >
                  {s[user.status] || user.status}
                </span>
              </td>

              <td>
                {canEditUsers && (
                  <button
                    className="edit-btn"
                    onClick={() => handleEditClick(user)}
                  >
                    {t.editButton}
                  </button>
                )}

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(user.id)}
                >
                  {t.deleteButton}
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
