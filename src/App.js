// src/App.js
import "./App.css";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import UsersPage from "./pages/UsersPage";

function DashboardPage() {
  return (
    <div className="cards">
      <div className="stat-box">
        <h2>Total Users</h2>
        <p className="stat-number">1,248</p>
        <p className="stat-desc">This week +28</p>
      </div>
      <div className="stat-box">
        <h2>Total Orders</h2>
        <p className="stat-number">312</p>
        <p className="stat-desc">Today +9</p>
      </div>
      <div className="stat-box">
        <h2>Reveneu</h2>
        <p className="stat-number">$8.420</p>
        <p className="stat-desc">Last 7 days</p>
      </div>
    </div>
  );
}

function SettingsPage() {
  return <h2>Settings Page</h2>;
}

function OrdersPage() {
  return <h2>Orders Page</h2>;
}

function App() {
  const location = useLocation(); // şu anki URL

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">My Admin</div>

        <nav className="menu">
          <Link
            to="/"
            className={`menu-item ${
              location.pathname === "/" ? "active" : ""
            }`}
          >
            Dashboard
          </Link>

          <Link
            to="/users"
            className={`menu-item ${
              location.pathname === "/users" ? "active" : ""
            }`}
          >
            Users
          </Link>

          <Link
            to="/orders"
            className={`menu-item ${
              location.pathname === "/orders" ? "active" : ""
            }`}
          >
            Orders
          </Link>

          <Link
            to="/settings"
            className={`menu-item ${
              location.pathname === "/settings" ? "active" : ""
            }`}
          >
            Settings
          </Link>
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <h1>
              {location.pathname === "/"
                ? "Dashboard"
                : location.pathname === "/users"
                ? "Users"
                : location.pathname === "/orders"
                ? "Orders"
                : location.pathname === "/settings"
                ? "Settings"
                : "Dashboard"}
            </h1>
            <p>Welcome Back</p>
          </div>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
