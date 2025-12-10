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
  },
};

function OrdersPage({ language }) {
  const { settings, language: ctxLanguage } = useSettings();

  // Dil önceliği: prop > context.language > settings.language > "en"
  const langKey = language || ctxLanguage || settings?.language || "en";
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

  useEffect(() => {
    localStorage.setItem("admin_orders", JSON.stringify(orders));
  }, [orders]);

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

  const totalAmount = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const shippedCount = orders.filter((o) => o.status === "Shipped").length;

  return (
    <div className="orders-container">
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

          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="orders-search-input"
          />
        </div>
      </div>

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

      <table className="orders-table">
        <thead>
          <tr>
            <th>{t.thId}</th>
            <th>{t.thCustomer}</th>
            <th>{t.thEmail}</th>
            <th>{t.thDate}</th>
            <th>{t.thTotal}</th>
            <th>{t.thStatusClickable}</th>
            <th>{t.thPayment}</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="7" className="orders-empty">
                {t.empty}
              </td>
            </tr>
          ) : (
            filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customer}</td>
                <td className="orders-email">{order.email}</td>
                <td>{order.date}</td>
                <td>€{order.total.toFixed(2)}</td>
                <td>
                  <span
                    className={`order-status order-status-${order.status.toLowerCase()}`}
                    onClick={() => handleToggleStatus(order.id)}
                  >
                    {s[order.status] || order.status}
                  </span>
                </td>
                <td>{order.method}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default OrdersPage;
