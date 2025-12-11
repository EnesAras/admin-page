// src/App.js
import "./App.css";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import UsersPage from "./pages/UsersPage";
import DashboardPage from "./pages/DashboardPage";
import OrdersPage from "./pages/OrdersPage";
import SettingsPage from "./pages/SettingsPage";
import ProductsPage from "./pages/ProductsPage";
import { useSettings } from "./context/SettingsContext";
import translations from "./i18n/translations";

function App() {
  const location = useLocation();
  const { theme = "dark", language = "en" } = useSettings();

  const dict = translations[language] || translations.en;

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
      default:
        return t("titleDashboard", "Dashboard");
    }
  };

  return (
    <div className={`app app-${theme === "light" ? "light" : "dark"}`}>
      <aside className="sidebar">
        <div className="logo">
          {t("nav.logo", "My Admin")}
        </div>

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

      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <h1>{getPageTitle(location.pathname)}</h1>
            <p>{t("nav.welcome", "Welcome back")}</p>
          </div>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<DashboardPage language={language} />} />
            <Route path="/users" element={<UsersPage language={language} />} />
            <Route
              path="/products"
              element={<ProductsPage language={language} />}
            />
            <Route
              path="/orders"
              element={<OrdersPage language={language} />}
            />
            <Route
              path="/settings"
              element={<SettingsPage language={language} />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
