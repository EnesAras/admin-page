// src/pages/OrdersPage.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import "./OrdersPage.css";
import { useSettings } from "../context/SettingsContext";
import translations from "../i18n/translations";
import ordersMock from "../data/orders.mock";
import { apiFetch } from "../lib/api";

const STATUS_FLOW = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const PAGE_SIZE = 20;

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

function normalizeStatusValue(value) {
  if (!value) return "Pending";
  const trimmed = String(value).trim().toLowerCase();
  if (!trimmed) return "Pending";
  if (trimmed === "canceled") return "Cancelled";
  return trimmed
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeMonetaryValue(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.-]+/g, "");
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatMoney(value) {
  return normalizeMonetaryValue(value).toFixed(2);
}

function normalizeOrder(order) {
  return {
    ...order,
    status: normalizeStatusValue(order.status),
    total: normalizeMonetaryValue(order.total ?? order.amount ?? order.price ?? 0),
  };
}

function normalizeOrdersPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.orders)) return payload.orders;
  return [];
}

function parseOrderDateMs(value) {
  if (!value) return NaN;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;

  const s = String(value).trim();

  // ISO: 2025-12-01 / 2025-12-01T...
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const ms = new Date(s).getTime();
    return Number.isNaN(ms) ? NaN : ms;
  }

  const ms = Date.parse(s);
  return Number.isNaN(ms) ? NaN : ms;
}

function OrdersPage({ language }) {
  const { settings, language: ctxLanguage } = useSettings();

  const langKey = language || ctxLanguage || settings?.language || "en";
  const dict = translations[langKey] || translations.en;

  const t = useCallback(
    (key, fallback) => {
      if (dict && dict[key] !== undefined) return dict[key];
      if (translations.en && translations.en[key] !== undefined) return translations.en[key];
      if (fallback !== undefined) return fallback;
      return key;
    },
    [dict]
  );

  const statusLabel = (status) => {
    switch (status) {
      case "Pending":
        return t("orderStatusPending", "Pending");
      case "Processing":
        return t("orderStatusProcessing", "Processing");
      case "Shipped":
        return t("orderStatusShipped", "Shipped");
      case "Delivered":
        return t("orderStatusDelivered", "Delivered");
      case "Cancelled":
        return t("orderStatusCancelled", "Cancelled");
      default:
        return status;
    }
  };

  // ==== STATE ====
  const [orders, setOrders] = useState(() => ordersMock.map(normalizeOrder));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [dateRange, setDateRange] = useState("all");

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Filtre/sıralama değişince sayfa 1’e dön
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateRange, sortBy, sortDirection]);

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const payload = await apiFetch("/api/orders");
        if (!isMounted) return;

        const normalized = normalizeOrdersPayload(payload).map(normalizeOrder);

        if (normalized.length > 0) {
          setOrders(normalized);
        } else {
          setOrders(ordersMock.map(normalizeOrder));
          setError(
            t(
              "orders.fetchEmpty",
              "There are no orders yet. Showing sample data."
            )
          );
        }
      } catch (err) {
        console.error(err);
        if (!isMounted) return;

        setOrders(ordersMock.map(normalizeOrder));
        setError(
          t(
            "orders.fetchError",
            "There was a problem loading orders. Showing sample data."
          )
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const formatDate = (dateStr) => {
    const ms = parseOrderDateMs(dateStr);
    if (Number.isNaN(ms)) return String(dateStr);

    return new Intl.DateTimeFormat(getLocaleFromLangKey(langKey), {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(ms));
  };

  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const nowMs = Date.now();

    return orders.filter((order) => {
      const customer = (order.customer || "").toLowerCase();
      const email = (order.email || "").toLowerCase();
      const idStr = String(order.id ?? "");

      const matchesSearch =
        term === "" ||
        customer.includes(term) ||
        email.includes(term) ||
        idStr.includes(term);

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      let matchesDate = true;
      if (dateRange !== "all" && order.date) {
        const orderMs = parseOrderDateMs(order.date);
        if (!Number.isNaN(orderMs)) {
          const diffDays = (nowMs - orderMs) / (1000 * 60 * 60 * 24);
          const limit = Number(dateRange);
          matchesDate = diffDays >= 0 && diffDays <= limit;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateRange]);

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let valA;
      let valB;

      switch (sortBy) {
        case "id":
          valA = a.id ?? 0;
          valB = b.id ?? 0;
          break;
        case "customer":
          valA = (a.customer || "").toLowerCase();
          valB = (b.customer || "").toLowerCase();
          break;
        case "date":
          valA = parseOrderDateMs(a.date);
          valB = parseOrderDateMs(b.date);
          if (Number.isNaN(valA)) valA = -Infinity;
          if (Number.isNaN(valB)) valB = -Infinity;
          break;
        case "total":
          valA = a.total ?? 0;
          valB = b.total ?? 0;
          break;
        default:
          valA = 0;
          valB = 0;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredOrders, sortBy, sortDirection]);

  // ✅ Pagination slice
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / PAGE_SIZE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedOrders.slice(start, start + PAGE_SIZE);
  }, [sortedOrders, currentPage]);

  const handleToggleStatus = async (id) => {
    const targetOrder = orders.find((order) => String(order.id) === String(id));
    if (!targetOrder) return;

    const currentIndex = STATUS_FLOW.indexOf(targetOrder.status);
    const nextStatus =
      currentIndex === -1
        ? STATUS_FLOW[0]
        : STATUS_FLOW[(currentIndex + 1) % STATUS_FLOW.length];

    try {
      const updated = normalizeOrder(
        await apiFetch(`/api/orders/${encodeURIComponent(targetOrder.id)}`, {
          method: "PUT",
          body: JSON.stringify({ status: nextStatus }),
        })
      );
      setOrders((prev) =>
        prev.map((order) =>
          String(order.id) === String(targetOrder.id) ? updated : order
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        t(
          "orders.statusUpdateError",
          "Unable to update the order status right now."
        )
      );
    }
  };

  const handleSort = (key) => {
    setSortBy((prevKey) => {
      if (prevKey === key) {
        setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevKey;
      }
      setSortDirection(key === "date" ? "desc" : "asc");
      return key;
    });
  };

  const renderSortIndicator = (key) => {
    if (sortBy !== key) return "⇅";
    return sortDirection === "asc" ? "▲" : "▼";
  };

  const handleExportCsv = () => {
    if (!filteredOrders.length) return;

    const headers = ["id", "customer", "email", "date", "total", "status", "payment"];
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
            typeof field === "string" ? `"${field.replace(/"/g, '""')}"` : field
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalAmount = useMemo(
    () =>
      orders.reduce(
        (sum, o) => sum + normalizeMonetaryValue(o.total ?? o.amount ?? o.price ?? 0),
        0
      ),
    [orders]
  );
  const pendingCount = useMemo(() => orders.filter((o) => o.status === "Pending").length, [orders]);
  const shippedCount = useMemo(() => orders.filter((o) => o.status === "Shipped").length, [orders]);
  const deliveredCount = useMemo(
    () => orders.filter((o) => o.status === "Delivered").length,
    [orders]
  );

  const selectedOrder =
    selectedOrderId != null ? orders.find((o) => o.id === selectedOrderId) || null : null;

  useEffect(() => {
    if (!selectedOrder) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedOrderId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOrder]);

  const resultsTemplate = t("orders.resultsSummary", "Showing {current} of {total} orders");
  const resultsText = resultsTemplate
    .replace("{current}", String(filteredOrders.length))
    .replace("{total}", String(orders.length));

  return (
    <div className="orders-container">
      <div className="orders-header page-header">
        <div className="page-header-main">
          <span className="page-header-icon" aria-hidden="true">
            📦
          </span>
          <div>
            <p className="page-header-title">
              {t("orders.title", "Orders")}
            </p>
            <span className="page-header-caption">
              {t("orders.subtitle", "Track and manage recent orders.")}
            </span>
          </div>
        </div>

        <div className="orders-header-right">
          <div className="orders-filters">
            <div className="orders-date-filter">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="orders-date-select"
              >
                <option value="all">{t("orders.dateRangeAll", "All time")}</option>
                <option value="7">{t("orders.dateRange7", "Last 7 days")}</option>
                <option value="30">{t("orders.dateRange30", "Last 30 days")}</option>
                <option value="90">{t("orders.dateRange90", "Last 90 days")}</option>
                <option value="365">{t("orders.dateRange365", "Last 12 months")}</option>
              </select>
            </div>

            <button className={`filter-btn ${statusFilter === "all" ? "active" : ""}`} onClick={() => setStatusFilter("all")}>
              {t("orders.filterAll", "All")}
            </button>
            <button className={`filter-btn ${statusFilter === "Pending" ? "active" : ""}`} onClick={() => setStatusFilter("Pending")}>
              {statusLabel("Pending")}
            </button>
            <button className={`filter-btn ${statusFilter === "Processing" ? "active" : ""}`} onClick={() => setStatusFilter("Processing")}>
              {statusLabel("Processing")}
            </button>
            <button className={`filter-btn ${statusFilter === "Shipped" ? "active" : ""}`} onClick={() => setStatusFilter("Shipped")}>
              {statusLabel("Shipped")}
            </button>
            <button className={`filter-btn ${statusFilter === "Delivered" ? "active" : ""}`} onClick={() => setStatusFilter("Delivered")}>
              {statusLabel("Delivered")}
            </button>
            <button className={`filter-btn ${statusFilter === "Cancelled" ? "active" : ""}`} onClick={() => setStatusFilter("Cancelled")}>
              {statusLabel("Cancelled")}
            </button>
          </div>

          <div className="orders-search">
            <input
              type="text"
              placeholder={t("orders.searchPlaceholder", "Search by name, email, ID...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="orders-search-input"
            />
          </div>
        </div>
      </div>

      <div className="orders-summary">
        <div className="orders-summary-card">
          <span className="summary-label">{t("orders.summaryTotalOrders", "Total Orders")}</span>
          <span className="summary-value">{orders.length}</span>
        </div>
        <div className="orders-summary-card">
          <span className="summary-label">{statusLabel("Pending")}</span>
          <span className="summary-value summary-pending">{pendingCount}</span>
        </div>
        <div className="orders-summary-card">
          <span className="summary-label">{statusLabel("Shipped")}</span>
          <span className="summary-value summary-shipped">{shippedCount}</span>
        </div>
        <div className="orders-summary-card">
          <span className="summary-label">{statusLabel("Delivered")}</span>
          <span className="summary-value summary-delivered">{deliveredCount}</span>
        </div>
        <div className="orders-summary-card">
          <span className="summary-label">{t("orders.summaryTotalRevenue", "Total Revenue")}</span>
          <span className="summary-value summary-revenue">€{formatMoney(totalAmount)}</span>
        </div>
      </div>

      {loading && <div className="orders-loading">{t("orders.loading", "Loading orders...")}</div>}
      {error && !loading && <div className="orders-error">{error}</div>}

      <div className="orders-meta-bar">
        <span className="orders-meta-results">{resultsText}</span>
        <button type="button" className="orders-export-btn" onClick={handleExportCsv} disabled={!filteredOrders.length}>
          {t("orders.exportCsv", "Export CSV")}
        </button>
      </div>

      <div className="orders-main-card">
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
            <tr>
              <th className="orders-th-sortable" onClick={() => handleSort("id")}>
                <span>{t("orders.thId", "ID")}</span>
                <span className="sort-indicator">{renderSortIndicator("id")}</span>
              </th>
              <th className="orders-th-sortable" onClick={() => handleSort("customer")}>
                <span>{t("orders.thCustomer", "Customer")}</span>
                <span className="sort-indicator">{renderSortIndicator("customer")}</span>
              </th>
              <th>{t("orders.thEmail", "Email")}</th>
              <th className="orders-th-sortable" onClick={() => handleSort("date")}>
                <span>{t("orders.thDate", "Date")}</span>
                <span className="sort-indicator">{renderSortIndicator("date")}</span>
              </th>
              <th className="orders-th-sortable" onClick={() => handleSort("total")}>
                <span>{t("orders.thTotal", "Total")}</span>
                <span className="sort-indicator">{renderSortIndicator("total")}</span>
              </th>
              <th
                className="orders-th-status"
                title={t("orders.statusHint", "Click to change")}
              >
                {t("orders.thStatus", "Status")}
              </th>
              <th>{t("orders.thPayment", "Payment")}</th>
            </tr>
          </thead>

          <tbody>
            {paginatedOrders.length === 0 && !loading ? (
              <tr>
                <td colSpan="7" className="orders-empty">
                  {t("orders.empty", "No orders found for this filter.")}
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => {
                const statusSafe = String(order.status || "Pending");
                const statusClass = statusSafe.toLowerCase();

                return (
                  <tr
                    key={order.id}
                    className={order.id === selectedOrderId ? "orders-row selected" : "orders-row"}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <td>#{order.id}</td>
                    <td>{order.customer}</td>
                    <td className="orders-email">{order.email}</td>
                    <td>{formatDate(order.date)}</td>
                    <td>€{formatMoney(order.total)}</td>
                    <td>
                      <span
                        className={`order-status order-status-${statusClass}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(order.id);
                        }}
                      >
                        {statusLabel(statusSafe)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`payment-pill payment-${String(order.method || "")
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {order.method}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>

        <div className="orders-pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            Prev
          </button>

          <span>
            Page {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>

      </div>

      {selectedOrder && (
        <div
          className="order-details-modal"
          role="dialog"
          aria-modal="true"
          aria-label={t("orders.detailsTitle", "Order details")}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrderId(null);
            }
          }}
        >
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
                <span className="details-value">#{selectedOrder.id}</span>
              </div>
              <div className="order-details-item">
                <span className="details-label">
                  {t("orders.detailsCustomer", "Customer")}
                </span>
                <span className="details-value">{selectedOrder.customer}</span>
              </div>
              <div className="order-details-item">
                <span className="details-label">
                  {t("orders.detailsEmail", "Email")}
                </span>
                <span className="details-value">{selectedOrder.email}</span>
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
                  €{formatMoney(selectedOrder.total)}
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
                <span className="details-value">{selectedOrder.method}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
