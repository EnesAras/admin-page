// src/App.jsx
import "./App.css";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import UsersPage from "./pages/UsersPage";
import DashboardPage from "./pages/DashboardPage";
import OrdersPage from "./pages/OrdersPage";
import SettingsPage from "./pages/SettingsPage";
import ProductsPage from "./pages/ProductsPage";
import { useSettings } from "./context/SettingsContext";

const uiTexts = {
  en: {
    logo: "My Admin",
    navDashboard: "Dashboard",
    navUsers: "Users",
    navProducts: "Products",
    navOrders: "Orders",
    navSettings: "Settings",
    welcome: "Welcome back",
    titleDashboard: "Dashboard",
    titleUsers: "Users",
    titleProducts: "Products",
    titleOrders: "Orders",
    titleSettings: "Settings",
  },
  tr: {
    logo: "Yönetim Paneli",
    navDashboard: "Panel",
    navUsers: "Kullanıcılar",
    navProducts: "Ürünler",
    navOrders: "Siparişler",
    navSettings: "Ayarlar",
    welcome: "Tekrar hoş geldin",
    titleDashboard: "Panel",
    titleUsers: "Kullanıcılar",
    titleProducts: "Ürünler",
    titleOrders: "Siparişler",
    titleSettings: "Ayarlar",
  },
  es: {
    logo: "Mi Panel",
    navDashboard: "Panel",
    navUsers: "Usuarios",
    navProducts: "Productos",
    navOrders: "Pedidos",
    navSettings: "Ajustes",
    welcome: "Bienvenido de nuevo",
    titleDashboard: "Panel",
    titleUsers: "Usuarios",
    titleProducts: "Productos",
    titleOrders: "Pedidos",
    titleSettings: "Ajustes",
  },
  de: {
    logo: "Admin Bereich",
    navDashboard: "Übersicht",
    navUsers: "Benutzer",
    navProducts: "Produkte",
    navOrders: "Bestellungen",
    navSettings: "Einstellungen",
    welcome: "Willkommen zurück",
    titleDashboard: "Übersicht",
    titleUsers: "Benutzer",
    titleProducts: "Produkte",
    titleOrders: "Bestellungen",
    titleSettings: "Einstellungen",
  },
  fr: {
    logo: "Mon Admin",
    navDashboard: "Tableau de bord",
    navUsers: "Utilisateurs",
    navProducts: "Produits",
    navOrders: "Commandes",
    navSettings: "Paramètres",
    welcome: "Ravi de te revoir",
    titleDashboard: "Tableau de bord",
    titleUsers: "Utilisateurs",
    titleProducts: "Produits",
    titleOrders: "Commandes",
    titleSettings: "Paramètres",
  },
  it: {
    logo: "Pannello Admin",
    navDashboard: "Dashboard",
    navUsers: "Utenti",
    navProducts: "Prodotti",
    navOrders: "Ordini",
    navSettings: "Impostazioni",
    welcome: "Bentornato",
    titleDashboard: "Dashboard",
    titleUsers: "Utenti",
    titleProducts: "Prodotti",
    titleOrders: "Ordini",
    titleSettings: "Impostazioni",
  },
  ru: {
    logo: "Админ панель",
    navDashboard: "Панель",
    navUsers: "Пользователи",
    navProducts: "Товары",
    navOrders: "Заказы",
    navSettings: "Настройки",
    welcome: "С возвращением",
    titleDashboard: "Панель",
    titleUsers: "Пользователи",
    titleProducts: "Товары",
    titleOrders: "Заказы",
    titleSettings: "Настройки",
  },
};

function App() {
  const location = useLocation();
  const { settings } = useSettings();

  const lang = settings?.language || "en";
  const theme = settings?.theme || "dark";

  const t = uiTexts[lang] || uiTexts.en;

  const getPageTitle = (path) => {
    if (path === "/") return t.titleDashboard;
    if (path === "/users") return t.titleUsers;
    if (path === "/products") return t.titleProducts;
    if (path === "/orders") return t.titleOrders;
    if (path === "/settings") return t.titleSettings;
    return t.titleDashboard;
  };

  return (
    <div className={`app ${theme === "light" ? "theme-light" : "theme-dark"}`}>
      <aside className="sidebar">
        <div className="logo">{t.logo}</div>

        <nav className="menu">
          <Link
            to="/"
            className={`menu-item ${location.pathname === "/" ? "active" : ""}`}
          >
            {t.navDashboard}
          </Link>

          <Link
            to="/users"
            className={`menu-item ${location.pathname === "/users" ? "active" : ""}`}
          >
            {t.navUsers}
          </Link>

          <Link
            to="/products"
            className={`menu-item ${
              location.pathname === "/products" ? "active" : ""
            }`}
          >
            {t.navProducts}
          </Link>

          <Link
            to="/orders"
            className={`menu-item ${
              location.pathname === "/orders" ? "active" : ""
            }`}
          >
            {t.navOrders}
          </Link>

          <Link
            to="/settings"
            className={`menu-item ${
              location.pathname === "/settings" ? "active" : ""
            }`}
          >
            {t.navSettings}
          </Link>
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <h1>{getPageTitle(location.pathname)}</h1>
            <p>{t.welcome}</p>
          </div>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<DashboardPage language={lang} />} />
            <Route path="/users" element={<UsersPage language={lang} />} />
            <Route path="/products" element={<ProductsPage language={lang} />} />
            <Route path="/orders" element={<OrdersPage language={lang} />} />
            <Route path="/settings" element={<SettingsPage language={lang} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
