// src/pages/OrdersPage.jsx
import { useState, useEffect } from "react";
import "./OrdersPage.css";
import { useSettings } from "../context/SettingsContext";

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

const statusLabels = {
  en: {
    Pending: "Pending",
    Processing: "Processing",
    Shipped: "Shipped",
    Cancelled: "Cancelled",
  },
  tr: {
    Pending: "Beklemede",
    Processing: "İşleniyor",
    Shipped: "Gönderildi",
    Cancelled: "İptal edildi",
  },
  es: {
    Pending: "Pendiente",
    Processing: "En proceso",
    Shipped: "Enviado",
    Cancelled: "Cancelado",
  },
  de: {
    Pending: "Ausstehend",
    Processing: "In Bearbeitung",
    Shipped: "Versendet",
    Cancelled: "Storniert",
  },
  fr: {
    Pending: "En attente",
    Processing: "En cours",
    Shipped: "Expédiée",
    Cancelled: "Annulée",
  },
  it: {
    Pending: "In attesa",
    Processing: "In elaborazione",
    Shipped: "Spedito",
    Cancelled: "Annullato",
  },
  ru: {
    Pending: "В ожидании",
    Processing: "В обработке",
    Shipped: "Отправлен",
    Cancelled: "Отменён",
  },
};

const TEXTS = {
  en: {
    title: "Orders",
    subtitle: "Track and manage recent orders.",
    filterAll: "All",
    searchPlaceholder: "Search by name, email, ID...",
    summaryTotalOrders: "Total Orders",
    summaryTotalRevenue: "Total Revenue",
    thId: "ID",
    thCustomer: "Customer",
    thEmail: "Email",
    thDate: "Date",
    thTotal: "Total",
    thStatusClickable: "Status (click to change)",
    thPayment: "Payment",
    empty: "No orders found for this filter.",
    resultsSummary: "Showing {current} of {total} orders",
    exportCsv: "Export CSV",
    detailsTitle: "Order details",
    detailsOrderId: "Order ID",
    detailsCustomer: "Customer",
    detailsEmail: "Email",
    detailsDate: "Date",
    detailsTotal: "Total amount",
    detailsStatus: "Status",
    detailsPayment: "Payment method",
    detailsClose: "Close",
  },
  tr: {
    title: "Siparişler",
    subtitle: "Son siparişleri takip et ve yönet.",
    filterAll: "Hepsi",
    searchPlaceholder: "İsim, e-posta veya ID ile ara...",
    summaryTotalOrders: "Toplam Sipariş",
    summaryTotalRevenue: "Toplam Gelir",
    thId: "ID",
    thCustomer: "Müşteri",
    thEmail: "E-posta",
    thDate: "Tarih",
    thTotal: "Tutar",
    thStatusClickable: "Durum (değiştirmek için tıkla)",
    thPayment: "Ödeme",
    empty: "Bu filtreye uygun sipariş bulunamadı.",
    resultsSummary: "Toplam {total} siparişten {current} tanesi görüntüleniyor",
    exportCsv: "CSV olarak dışa aktar",
    detailsTitle: "Sipariş detayı",
    detailsOrderId: "Sipariş ID",
    detailsCustomer: "Müşteri",
    detailsEmail: "E-posta",
    detailsDate: "Tarih",
    detailsTotal: "Toplam tutar",
    detailsStatus: "Durum",
    detailsPayment: "Ödeme yöntemi",
    detailsClose: "Kapat",
  },
  es: {
    title: "Pedidos",
    subtitle: "Controla y gestiona los pedidos recientes.",
    filterAll: "Todos",
    searchPlaceholder: "Buscar por nombre, correo, ID...",
    summaryTotalOrders: "Pedidos totales",
    summaryTotalRevenue: "Ingresos totales",
    thId: "ID",
    thCustomer: "Cliente",
    thEmail: "Correo",
    thDate: "Fecha",
    thTotal: "Total",
    thStatusClickable: "Estado (clic para cambiar)",
    thPayment: "Pago",
    empty: "No se encontraron pedidos para este filtro.",
    resultsSummary: "Mostrando {current} de {total} pedidos",
    exportCsv: "Exportar CSV",
    detailsTitle: "Detalles del pedido",
    detailsOrderId: "ID del pedido",
    detailsCustomer: "Cliente",
    detailsEmail: "Correo",
    detailsDate: "Fecha",
    detailsTotal: "Importe total",
    detailsStatus: "Estado",
    detailsPayment: "Método de pago",
    detailsClose: "Cerrar",
  },
  de: {
    title: "Bestellungen",
    subtitle: "Verfolge und verwalte aktuelle Bestellungen.",
    filterAll: "Alle",
    searchPlaceholder: "Nach Name, E-Mail oder ID suchen...",
    summaryTotalOrders: "Gesamtbestellungen",
    summaryTotalRevenue: "Gesamtumsatz",
    thId: "ID",
    thCustomer: "Kunde",
    thEmail: "E-Mail",
    thDate: "Datum",
    thTotal: "Summe",
    thStatusClickable: "Status (zum Ändern klicken)",
    thPayment: "Zahlung",
    empty: "Für diesen Filter wurden keine Bestellungen gefunden.",
    resultsSummary: "Zeige {current} von {total} Bestellungen",
    exportCsv: "Als CSV exportieren",
    detailsTitle: "Bestelldetails",
    detailsOrderId: "Bestell-ID",
    detailsCustomer: "Kunde",
    detailsEmail: "E-Mail",
    detailsDate: "Datum",
    detailsTotal: "Gesamtbetrag",
    detailsStatus: "Status",
    detailsPayment: "Zahlungsmethode",
    detailsClose: "Schließen",
  },
  fr: {
    title: "Commandes",
    subtitle: "Suivez et gérez les commandes récentes.",
    filterAll: "Toutes",
    searchPlaceholder: "Rechercher par nom, e-mail, ID...",
    summaryTotalOrders: "Commandes totales",
    summaryTotalRevenue: "Revenu total",
    thId: "ID",
    thCustomer: "Client",
    thEmail: "E-mail",
    thDate: "Date",
    thTotal: "Total",
    thStatusClickable: "Statut (cliquer pour changer)",
    thPayment: "Paiement",
    empty: "Aucune commande trouvée pour ce filtre.",
    resultsSummary: "Affichage de {current} sur {total} commandes",
    exportCsv: "Exporter en CSV",
    detailsTitle: "Détails de la commande",
    detailsOrderId: "ID de commande",
    detailsCustomer: "Client",
    detailsEmail: "E-mail",
    detailsDate: "Date",
    detailsTotal: "Montant total",
    detailsStatus: "Statut",
    detailsPayment: "Méthode de paiement",
    detailsClose: "Fermer",
  },
  it: {
    title: "Ordini",
    subtitle: "Monitora e gestisci gli ordini recenti.",
    filterAll: "Tutti",
    searchPlaceholder: "Cerca per nome, email, ID...",
    summaryTotalOrders: "Ordini totali",
    summaryTotalRevenue: "Entrate totali",
    thId: "ID",
    thCustomer: "Cliente",
    thEmail: "Email",
    thDate: "Data",
    thTotal: "Totale",
    thStatusClickable: "Stato (clicca per cambiare)",
    thPayment: "Pagamento",
    empty: "Nessun ordine trovato per questo filtro.",
    resultsSummary: "Visualizzazione di {current} su {total} ordini",
    exportCsv: "Esporta CSV",
    detailsTitle: "Dettagli ordine",
    detailsOrderId: "ID ordine",
    detailsCustomer: "Cliente",
    detailsEmail: "Email",
    detailsDate: "Data",
    detailsTotal: "Importo totale",
    detailsStatus: "Stato",
    detailsPayment: "Metodo di pagamento",
    detailsClose: "Chiudi",
  },
  ru: {
    title: "Заказы",
    subtitle: "Отслеживайте и управляйте последними заказами.",
    filterAll: "Все",
    searchPlaceholder: "Поиск по имени, e-mail или ID...",
    summaryTotalOrders: "Всего заказов",
    summaryTotalRevenue: "Общая выручка",
    thId: "ID",
    thCustomer: "Клиент",
    thEmail: "E-mail",
    thDate: "Дата",
    thTotal: "Сумма",
    thStatusClickable: "Статус (кликните, чтобы изменить)",
    thPayment: "Оплата",
    empty: "Для этого фильтра заказы не найдены.",
    resultsSummary: "Показано {current} из {total} заказов",
    exportCsv: "Экспорт CSV",
    detailsTitle: "Детали заказа",
    detailsOrderId: "ID заказа",
    detailsCustomer: "Клиент",
    detailsEmail: "E-mail",
    detailsDate: "Дата",
    detailsTotal: "Итоговая сумма",
    detailsStatus: "Статус",
    detailsPayment: "Способ оплаты",
    detailsClose: "Закрыть",
  },
};

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
  const { settings } = useSettings();
  const langKey = language || settings?.language || "en";
  const t = TEXTS[langKey] || TEXTS.en;
  const s = statusLabels[langKey] || statusLabels.en;

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

  const resultsText = t.resultsSummary
    .replace("{current}", filteredOrders.length)
    .replace("{total}", orders.length);

  return (
    <div className="orders-container">
      {/* HEADER */}
      <div className="orders-header">
        <div className="orders-header-left">
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
        </div>

        <div className="orders-header-right">
          <div className="orders-filters">
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
                statusFilter === "Pending" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("Pending")}
            >
              {s.Pending}
            </button>
            <button
              className={`filter-btn ${
                statusFilter === "Processing" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("Processing")}
            >
              {s.Processing}
            </button>
            <button
              className={`filter-btn ${
                statusFilter === "Shipped" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("Shipped")}
            >
              {s.Shipped}
            </button>
            <button
              className={`filter-btn ${
                statusFilter === "Cancelled" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("Cancelled")}
            >
              {s.Cancelled}
            </button>
          </div>

          <div className="orders-search">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
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
          <span className="summary-label">{t.summaryTotalOrders}</span>
          <span className="summary-value">{orders.length}</span>
        </div>
        <div className="orders-summary-card">
          <span className="summary-label">{s.Pending}</span>
          <span className="summary-value summary-pending">
            {pendingCount}
          </span>
        </div>
        <div className="orders-summary-card">
          <span className="summary-label">{s.Shipped}</span>
          <span className="summary-value summary-shipped">
            {shippedCount}
          </span>
        </div>
        <div className="orders-summary-card">
          <span className="summary-label">{t.summaryTotalRevenue}</span>
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
          {t.exportCsv}
        </button>
      </div>

      {/* MAIN CARD + TABLE */}
      <div className="orders-main-card">
        <table className="orders-table">
          <thead>
            <tr>
              <th
                className="orders-th-sortable"
                onClick={() => handleSort("id")}
              >
                <span>{t.thId}</span>
                <span className="sort-indicator">
                  {renderSortIndicator("id")}
                </span>
              </th>
              <th
                className="orders-th-sortable"
                onClick={() => handleSort("customer")}
              >
                <span>{t.thCustomer}</span>
                <span className="sort-indicator">
                  {renderSortIndicator("customer")}
                </span>
              </th>
              <th>{t.thEmail}</th>
              <th
                className="orders-th-sortable"
                onClick={() => handleSort("date")}
              >
                <span>{t.thDate}</span>
                <span className="sort-indicator">
                  {renderSortIndicator("date")}
                </span>
              </th>
              <th
                className="orders-th-sortable"
                onClick={() => handleSort("total")}
              >
                <span>{t.thTotal}</span>
                <span className="sort-indicator">
                  {renderSortIndicator("total")}
                </span>
              </th>
              <th>{t.thStatusClickable}</th>
              <th>{t.thPayment}</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="orders-empty">
                  {t.empty}
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
                      {s[order.status] || order.status}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-pill payment-${order.method
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
              <h3>{t.detailsTitle}</h3>
              <button
                type="button"
                className="order-details-close"
                onClick={() => setSelectedOrderId(null)}
              >
                {t.detailsClose}
              </button>
            </div>
            <div className="order-details-grid">
              <div className="order-details-item">
                <span className="details-label">{t.detailsOrderId}</span>
                <span className="details-value">#{selectedOrder.id}</span>
              </div>
              <div className="order-details-item">
                <span className="details-label">
                  {t.detailsCustomer}
                </span>
                <span className="details-value">
                  {selectedOrder.customer}
                </span>
              </div>
              <div className="order-details-item">
                <span className="details-label">{t.detailsEmail}</span>
                <span className="details-value">
                  {selectedOrder.email}
                </span>
              </div>
              <div className="order-details-item">
                <span className="details-label">{t.detailsDate}</span>
                <span className="details-value">
                  {formatDate(selectedOrder.date)}
                </span>
              </div>
              <div className="order-details-item">
                <span className="details-label">{t.detailsTotal}</span>
                <span className="details-value">
                  €{selectedOrder.total.toFixed(2)}
                </span>
              </div>
              <div className="order-details-item">
                <span className="details-label">{t.detailsStatus}</span>
                <span className="details-value">
                  {s[selectedOrder.status] || selectedOrder.status}
                </span>
              </div>
              <div className="order-details-item">
                <span className="details-label">
                  {t.detailsPayment}
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
