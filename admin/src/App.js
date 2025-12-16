// src/App.js
import "./App.css";
import {
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";

import UsersPage from "./pages/UsersPage";
import DashboardPage from "./pages/DashboardPage";
import OrdersPage from "./pages/OrdersPage";
import SettingsPage from "./pages/SettingsPage";
import ProductsPage from "./pages/ProductsPage";

import { useSettings } from "./context/SettingsContext";
import translations from "./i18n/translations";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./context/AuthContext";
import { useState, useEffect, useRef } from "react"; 



const ROLES = {
  ADMIN: "admin",
  OWNER: "owner",
  MODERATOR: "moderator",
};
const FULL_ACCESS_ROLES = [ROLES.ADMIN, ROLES.OWNER, ROLES.MODERATOR];
const ADMIN_OWNER_ROLES = [ROLES.ADMIN, ROLES.OWNER];

function App() {
  const menuRef = useRef(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { colorMode = "dark", language = "en", theme } = useSettings();
  const { isAuthenticated, logout, currentUser, hasRole } = useAuth();

  const dict = translations[language] || translations.en;
  const displayName = currentUser?.name || "Guest User";
  const displayRole = currentUser?.role || "Admin";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("") || "GU";

useEffect(() => {
  setIsUserMenuOpen(false);
}, [location.pathname]);

useEffect(() => {
  if (!isUserMenuOpen) return;

  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setIsUserMenuOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsUserMenuOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
    document.removeEventListener("keydown", handleKeyDown);
  };
}, [isUserMenuOpen]);



  const t = (key, fallback) => {
    if (dict && dict[key] !== undefined) return dict[key];
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key];
    }
    if (fallback !== undefined) return fallback;
    return key;
  };

  const getPageTitle = (path) => {
    switch (path) {
      case "/":
        return t("titleDashboard", "Dashboard");
      case "/users":
        return t("titleUsers", "Users");
      case "/products":
        return t("titleProducts", "Products");
      case "/orders":
        return t("titleOrders", "Orders");
      case "/settings":
        return t("titleSettings", "Settings");
      case "/login":
        return t("titleLogin", "Login");
      default:
        return t("titleDashboard", "Dashboard");
    }
  };

  const AccessDenied = () => (
    <div className="access-denied">
      <div>
        <p className="access-denied-title">
          {t("accessDeniedTitle", "Access denied")}
        </p>
        <p className="access-denied-message">
          {t(
            "accessDeniedMessage",
            "You do not have the required permissions for this area."
          )}
        </p>
      </div>
      <button
        type="button"
        className="access-denied-button"
        onClick={() => navigate("/")}
      >
        {t("accessDeniedButton", "Return to dashboard")}
      </button>
    </div>
  );

  const PrivateRoute = ({ children, allowedRoles = [] }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (allowedRoles.length && !hasRole(allowedRoles)) {
      return <AccessDenied />;
    }

    return children;
  };


  const isLoginPage = location.pathname === "/login";

  const handleLogout = () => {
    setIsUserMenuOpen(false);  // menüyü kapat
    logout();                  // auth state reset
    navigate("/login", { replace: true });
  };


  const rootTheme = colorMode === "light" ? "light" : "dark";
  const themeClasses = ["app", `app-${rootTheme}`];
  if (theme === "system") {
    themeClasses.push("app-system");
  }

  return (
    <div className={themeClasses.join(" ")}>
      {/* Sidebar sadece login olunmuşsa */}
      {!isLoginPage && isAuthenticated && (
        <aside className="sidebar">
          <div className="logo">{t("nav.logo", "My Admin")}</div>

          <nav className="menu">
            <Link
              to="/"
              className={`menu-item ${
                location.pathname === "/" ? "active" : ""
              }`}
            >
              {t("nav.dashboard", "Dashboard")}
            </Link>

            <Link
              to="/users"
              className={`menu-item ${
                location.pathname === "/users" ? "active" : ""
              }`}
            >
              {t("nav.users", "Users")}
            </Link>

            <Link
              to="/products"
              className={`menu-item ${
                location.pathname === "/products" ? "active" : ""
              }`}
            >
              {t("nav.products", "Products")}
            </Link>

            <Link
              to="/orders"
              className={`menu-item ${
                location.pathname === "/orders" ? "active" : ""
              }`}
            >
              {t("nav.orders", "Orders")}
            </Link>

            <Link
              to="/settings"
              className={`menu-item ${
                location.pathname === "/settings" ? "active" : ""
              }`}
            >
              {t("nav.settings", "Settings")}
            </Link>
          </nav>
        </aside>
      )}

      <div
        className={`main ${
          isLoginPage || !isAuthenticated ? "main-full" : ""
        }`}
      >
                {!isLoginPage && isAuthenticated && (
          <header className="topbar">
            <div className="topbar-left">
              <h1>{getPageTitle(location.pathname)}</h1>
              <p>{t("nav.welcome", "Welcome back")}</p>
            </div>

            <div className="topbar-right">
              <div className="topbar-user" ref={menuRef}>
                <div className="topbar-user-info">
                  <span className="topbar-user-name">{displayName}</span>
                  <span className="topbar-user-role">{displayRole}</span>
                </div>

                <button
                  type="button"
                  className="topbar-avatar-btn"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                >
                  <span className="topbar-avatar-initials">{initials}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="topbar-user-menu">
                    <button
                      type="button"
                      className="topbar-user-menu-item"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate("/settings");
                      }}
                    >
                      {t("nav.profileSettings", "Profile & Settings")}
                    </button>
                    <button
                      type="button"
                      className="topbar-user-menu-item logout"
                      onClick={handleLogout}
                    >
                      {t("nav.logout", "Logout")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}


        <main className="content">
          <Routes>
            {/* Public: Login */}
<Route
  path="/login"
  element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
/>

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <PrivateRoute allowedRoles={FULL_ACCESS_ROLES}>
                  <DashboardPage language={language} />
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute allowedRoles={ADMIN_OWNER_ROLES}>
                  <UsersPage language={language} />
                </PrivateRoute>
              }
            />
            <Route
              path="/products"
              element={
                <PrivateRoute allowedRoles={ADMIN_OWNER_ROLES}>
                  <ProductsPage language={language} />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute allowedRoles={FULL_ACCESS_ROLES}>
                  <OrdersPage language={language} />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute allowedRoles={FULL_ACCESS_ROLES}>
                  <SettingsPage language={language} />
                </PrivateRoute>
              }
            />

            {/* Bilinmeyen path -> Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
