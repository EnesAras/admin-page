// src/pages/OrdersPage.jsx
import { useState, useEffect } from "react";
import "./OrdersPage.css";
import { useSettings } from "../context/SettingsContext";
import translations from "../i18n/translations";

const initialOrders = [
  {
    id: 101,
    customer: "Alex Turner",
    email: "alex.turner@example.com",
    date: "2025-12-01",
    total: 125.5,
    status: "Pending",
    method: "Credit Card",
  },
  {
    id: 102,
    customer: "Maria Lopez",
    email: "maria.lopez@example.com",
    date: "2025-12-03",
    total: 89.99,
    status: "Shipped",
    method: "PayPal",
  },
  {
    id: 103,
    customer: "David Kim",
    email: "david.kim@example.com",
    date: "2025-12-05",
    total: 42.0,
    status: "Cancelled",
    method: "Bank Transfer",
  },
  {
    id: 104,
    customer: "Emily Brown",
    email: "emily.brown@example.com",
    date: "2025-12-06",
    total: 210.25,
    status: "Processing",
    method: "Credit Card",
  },
];

const STATUS_FLOW = ["Pending", "Processing", "Shipped", "Cancelled"];

function getLocaleFromLangKey(langKey) {
  switch (langKey) {
    case "tr":
      return "tr-TR";
    case "es":
      return "es-ES";
    case "de":
      return "de-DE";
    case "fr":
      return "fr-FR";
    case "it":
      return "it-IT";
    case "ru":
      return "ru-RU";
    default:
      return "en-IE";
  }
}

function OrdersPage({ language }) {
  const { settings, language: ctxLanguage } = useSettings();

  const langKey = language || ctxLanguage || settings?.language || "en";
  const dict = translations[langKey] || translations.en;

  const t = (key, fallback) => {
    if (dict && dict[key] !== undefined) return dict[key];
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key];
    }
    if (fallback !== undefined) return fallback;
    return key;
  };

  const statusLabel = (status) => {
    switch (status) {
      case "Pending":
        return t("orderStatusPending", "Pending");
      case "Processing":
        return t("orderStatusProcessing", "Processing");
      case "Shipped":
        return t("orderStatusShipped", "Shipped");
      case "Cancelled":
        return t("orderStatusCancelled", "Cancelled");
      default:
        return status;
    }
  };

  const [orders, setOrders] = useState(() => {
    const stored = localStorage.getItem("admin_orders");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return initialOrders;
      }
    }
    return initialOrders;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    localStorage.setItem("admin_orders", JSON.stringify(orders));
  }, [orders]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat(getLocaleFromLangKey(langKey), {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  };

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase().trim();

    const matchesSearch =
      term === "" ||
      order.customer.toLowerCase().includes(term) ||
      order.email.toLowerCase().includes(term) ||
      String(order.id).includes(term);

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let valA;
    let valB;

    switch (sortBy) {
      case "id":
        valA = a.id;
        valB = b.id;
        break;
      case "customer":
        valA = a.customer.toLowerCase();
        valB = b.customer.toLowerCase();
        break;
      case "date":
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
        break;
      case "total":
        valA = a.total;
        valB = b.total;
        break;
      default:
        valA = 0;
        valB = 0;
    }

    if (valA < valB) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (valA > valB) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const handleToggleStatus = (id) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order;
        const currentIndex = STATUS_FLOW.indexOf(order.status);
        const nextStatus =
          currentIndex === -1
            ? "Pending"
            : STATUS_FLOW[(currentIndex + 1) % STATUS_FLOW.length];
        return {
          ...order,
          status: nextStatus,
        };
      })
    );
  };

  const handleSort = (key) => {
    setSortBy((prevKey) => {
      if (prevKey === key) {
        setSortDirection((prevDir) =>
          prevDir === "asc" ? "desc" : "asc"
        );
        return prevKey;
      } else {
        setSortDirection(key === "date" ? "desc" : "asc");
        return key;
      }
    });
  };

  const renderSortIndicator = (key) => {
    if (sortBy !== key) return "⇅";
    return sortDirection === "asc" ? "▲" : "▼";
  };

  const handleExportCsv = () => {
    if (!filteredOrders.length) return;

    const headers = [
      "id",
      "customer",
      "email",
      "date",
      "total",
      "status",
      "payment",
    ];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.customer,
      o.email,
      o.date,
      o.total,
      o.status,
      o.method,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        r
          .map((field) =>
            typeof field === "string"
              ? `"${field.replace(/"/g, '""')}"`
              : field
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalAmount = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const shippedCount = orders.filter((o) => o.status === "Shipped").length;

  const selectedOrder =
    selectedOrderId != null
      ? orders.find((o) => o.id === selectedOrderId) || null
      : null;

  const resultsTemplate = t(
    "orders.resultsSummary",
    "Showing {current} of {total} orders"
  );

  const resultsText = resultsTemplate
    .replace("{current}", String(filteredOrders.length))
    .replace("{total}", String(orders.length));

  return (
    <div className="orders-container">
      {/* HEADER */}
      <div className="orders-header">
        <div className="orders-header-left">
          <h2>{t("orders.title", "Orders")}</h2>
          <p>{t("orders.subtitle", "Track and manage recent orders.")}</p>
        </div>

        <div className="orders-header-right">
          <div className="orders-filters">
            <button
              className={`filter-btn ${
                statusFilter === "all" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("all")}
            >
              {t("orders.filterAll", "All")}
            </button>
            <button
              className={`filter-btn ${
                statusFilter === "Pending" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("Pending")}
            >
              {statusLabel("Pending")}
            </button>
            <button
              className={`filter-btn ${
                statusFilter === "Processing" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("Processing")}
            >
              {statusLabel("Processing")}
            </button>
            <button
              className={`filter-btn ${
                statusFilter === "Shipped" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("Shipped")}
            >
              {statusLabel("Shipped")}
            </button>
            <button
              className={`filter-btn ${
                statusFilter === "Cancelled" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("Cancelled")}
            >
              {statusLabel("Cancelled")}
            </button>
          </div>

          <div className="orders-search">
            <input
              type="text"
              placeholder={t(
                "orders.searchPlaceholder",
                "Search by name, email, ID..."
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="orders-search-input"
            />
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="orders-summary">
        <div className="orders-summary-card">
          <span className="summary-label">
            {t("orders.summaryTotalOrders", "Total Orders")}
          </span>
          <span className="summary-value">{orders.length}</span>
        </div>
        <div className="orders-summary-card">
          <span className="summary-label">
            {statusLabel("Pending")}
          </span>
          <span className="summary-value summary-pending">
            {pendingCount}
          </span>
        </div>
        <div className="orders-summary-card">
          <span className="summary-label">
            {statusLabel("Shipped")}
          </span>
          <span className="summary-value summary-shipped">
            {shippedCount}
          </span>
        </div>
        <div className="orders-summary-card">
          <span className="summary-label">
            {t("orders.summaryTotalRevenue", "Total Revenue")}
          </span>
          <span className="summary-value summary-revenue">
            €{totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* META BAR: RESULTS + EXPORT */}
      <div className="orders-meta-bar">
        <span className="orders-meta-results">{resultsText}</span>
        <button
          type="button"
          className="orders-export-btn"
          onClick={handleExportCsv}
          disabled={!filteredOrders.length}
        >
          {t("orders.exportCsv", "Export CSV")}
        </button>
      </div>

      {/* MAIN CARD + TABLE */}
      <div
        className={`orders-main-card ${
          selectedOrder ? "has-details" : "no-details"
        }`}
      >
        <table className="orders-table">
          <thead>
            <tr>
              <th
                className="orders-th-sortable"
                onClick={() => handleSort("id")}
              >
                <span>{t("orders.thId", "ID")}</span>
                <span className="sort-indicator">
                  {renderSortIndicator("id")}
                </span>
              </th>
              <th
                className="orders-th-sortable"
                onClick={() => handleSort("customer")}
              >
                <span>{t("orders.thCustomer", "Customer")}</span>
                <span className="sort-indicator">
                  {renderSortIndicator("customer")}
                </span>
              </th>
              <th>{t("orders.thEmail", "Email")}</th>
              <th
                className="orders-th-sortable"
                onClick={() => handleSort("date")}
              >
                <span>{t("orders.thDate", "Date")}</span>
                <span className="sort-indicator">
                  {renderSortIndicator("date")}
                </span>
              </th>
              <th
                className="orders-th-sortable"
                onClick={() => handleSort("total")}
              >
                <span>{t("orders.thTotal", "Total")}</span>
                <span className="sort-indicator">
                  {renderSortIndicator("total")}
                </span>
              </th>
              <th>
                {t(
                  "orders.thStatusClickable",
                  "Status (click to change)"
                )}
              </th>
              <th>{t("orders.thPayment", "Payment")}</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="orders-empty">
                  {t(
                    "orders.empty",
                    "No orders found for this filter."
                  )}
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => (
                <tr
                  key={order.id}
                  className={
                    order.id === selectedOrderId
                      ? "orders-row selected"
                      : "orders-row"
                  }
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <td>#{order.id}</td>
                  <td>{order.customer}</td>
                  <td className="orders-email">{order.email}</td>
                  <td>{formatDate(order.date)}</td>
                  <td>€{order.total.toFixed(2)}</td>
                  <td>
                    <span
                      className={`order-status order-status-${order.status.toLowerCase()}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(order.id);
                      }}
                    >
                      {statusLabel(order.status)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`payment-pill payment-${order.method
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {order.method}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* DETAILS PANEL */}
        {selectedOrder && (
          <div className="order-details-panel">
            <div className="order-details-header">
              <h3>{t("orders.detailsTitle", "Order details")}</h3>
              <button
                type="button"
                className="order-details-close"
                onClick={() => setSelectedOrderId(null)}
              >
                {t("orders.detailsClose", "Close")}
              </button>
            </div>
            <div className="order-details-grid">
              <div className="order-details-item">
                <span className="details-label">
                  {t("orders.detailsOrderId", "Order ID")}
                </span>
                <span className="details-value">
                  #{selectedOrder.id}
                </span>
              </div>
              <div className="order-details-item">
                <span className="details-label">
                  {t("orders.detailsCustomer", "Customer")}
                </span>
                <span className="details-value">
                  {selectedOrder.customer}
                </span>
              </div>
              <div className="order-details-item">
                <span className="details-label">
                  {t("orders.detailsEmail", "Email")}
                </span>
                <span className="details-value">
                  {selectedOrder.email}
                </span>
              </div>
              <div className="order-details-item">
                <span className="details-label">
                  {t("orders.detailsDate", "Date")}
                </span>
                <span className="details-value">
                  {formatDate(selectedOrder.date)}
                </span>
              </div>
              <div className="order-details-item">
                <span className="details-label">
                  {t("orders.detailsTotal", "Total amount")}
                </span>
                <span className="details-value">
                  €{selectedOrder.total.toFixed(2)}
                </span>
              </div>
              <div className="order-details-item">
                <span className="details-label">
                  {t("orders.detailsStatus", "Status")}
                </span>
                <span className="details-value">
                  {statusLabel(selectedOrder.status)}
                </span>
              </div>
              <div className="order-details-item">
                <span className="details-label">
                  {t("orders.detailsPayment", "Payment method")}
                </span>
                <span className="details-value">
                  {selectedOrder.method}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
