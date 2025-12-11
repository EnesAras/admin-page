// src/pages/ProductsPage.jsx
import { useState, useEffect } from "react";
import "./ProductsPage.css";
import { useSettings } from "../context/SettingsContext";
import translations from "../i18n/translations";

const initialProducts = [
  {
    id: 1,
    name: "Naruto Shippuden - Pain PVC Figure 25cm",
    category: "Figure",
    fandom: "Naruto",
    price: 49.9,
    stock: 12,
    status: "Active",
  },
  {
    id: 2,
    name: "Attack on Titan Vol. 1 Manga",
    category: "Manga",
    fandom: "Attack on Titan",
    price: 9.99,
    stock: 34,
    status: "Active",
  },
  {
    id: 3,
    name: "Akatsuki Desk Mat XL",
    category: "Desk Mat",
    fandom: "Naruto",
    price: 29.9,
    stock: 5,
    status: "Active",
  },
  {
    id: 4,
    name: "Demon Slayer Tanjiro Poster A2",
    category: "Poster",
    fandom: "Demon Slayer",
    price: 12.5,
    stock: 0,
    status: "OutOfStock",
  },
  {
    id: 5,
    name: "RGB Gaming Keyboard - Sakura Edition",
    category: "Keyboard",
    fandom: "Gaming",
    price: 89,
    stock: 7,
    status: "Hidden",
  },
];

const statusOptions = ["Active", "Hidden", "OutOfStock"];

function ProductsPage({ language }) {
  const { settings, language: ctxLanguage } = useSettings();

  // Dil önceliği: prop > context.language > settings.language > "en"
  const lang = language || ctxLanguage || settings?.language || "en";
  const dict = translations[lang] || translations.en;

  const t = (key, fallback) => {
    if (dict && dict[key] !== undefined) return dict[key];
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key];
    }
    if (fallback !== undefined) return fallback;
    return key;
  };

  const [products, setProducts] = useState(() => {
    const stored = localStorage.getItem("admin_products");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : initialProducts;
      } catch {
        return initialProducts;
      }
    }
    return initialProducts;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedId, setSelectedId] = useState(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formFandom, setFormFandom] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formStatus, setFormStatus] = useState("Active");
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("admin_products", JSON.stringify(products));
  }, [products]);

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  // === METRICS ===
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "Active").length;
  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= 5
  ).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const inventoryValue = products.reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  );

  // helper sadece sonuç metni için
  function filteredProductsLength(list, { searchTerm, statusFilter, categoryFilter }) {
    const term = searchTerm.toLowerCase().trim();
    return list.filter((product) => {
      const matchesSearch =
        term === "" ||
        product.name.toLowerCase().includes(term) ||
        product.fandom.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || product.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    }).length;
  }

  const currentCount = filteredProductsLength(products, {
    searchTerm,
    statusFilter,
    categoryFilter,
  });

  const resultsTemplate = t(
    "products.resultsSummary",
    "Showing {current} of {total} products"
  );

  const resultsText = resultsTemplate
    .replace("{current}", String(currentCount))
    .replace("{total}", String(totalProducts));

  // === FILTERED + SORTED LIST ===
  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase().trim();

    const matchesSearch =
      term === "" ||
      product.name.toLowerCase().includes(term) ||
      product.fandom.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let valA;
    let valB;

    switch (sortBy) {
      case "id":
        valA = a.id;
        valB = b.id;
        break;
      case "name":
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        break;
      case "category":
        valA = a.category.toLowerCase();
        valB = b.category.toLowerCase();
        break;
      case "price":
        valA = a.price;
        valB = b.price;
        break;
      case "stock":
        valA = a.stock;
        valB = b.stock;
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

  const handleSort = (key) => {
    setSortBy((prevKey) => {
      if (prevKey === key) {
        setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevKey;
      } else {
        setSortDirection(key === "name" ? "asc" : "desc");
        return key;
      }
    });
  };

  const renderSortIndicator = (key) => {
    if (sortBy !== key) return "⇅";
    return sortDirection === "asc" ? "▲" : "▼";
  };

  const openAddPanel = () => {
    setIsPanelOpen(true);
    setEditingId(null);
    setFormName("");
    setFormCategory("");
    setFormFandom("");
    setFormPrice("");
    setFormStock("");
    setFormStatus("Active");
    setError("");
  };

  const openEditPanel = (product) => {
    setIsPanelOpen(true);
    setEditingId(product.id);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormFandom(product.fandom);
    setFormPrice(String(product.price));
    setFormStock(String(product.stock));
    setFormStatus(product.status);
    setError("");
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setEditingId(null);
    setError("");
  };

  const handleSave = () => {
    if (!formName.trim()) {
      setError(t("products.error.nameRequired", "Name is required."));
      return;
    }

    const priceValue = Number(formPrice);
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setError(t("products.error.priceInvalid", "Enter a valid price."));
      return;
    }

    const stockValue = Number(formStock);
    if (!Number.isInteger(stockValue) || stockValue < 0) {
      setError(t("products.error.stockInvalid", "Stock must be 0 or higher."));
      return;
    }

    const payload = {
      name: formName.trim(),
      category: formCategory.trim() || "Other",
      fandom: formFandom.trim() || "General",
      price: priceValue,
      stock: stockValue,
      status: formStatus,
    };

    if (editingId == null) {
      const nextId =
        products.length > 0
          ? Math.max(...products.map((p) => p.id)) + 1
          : 1;

      const newProduct = {
        id: nextId,
        ...payload,
      };

      setProducts((prev) => [...prev, newProduct]);
      setSelectedId(nextId);
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...payload } : p))
      );
      setSelectedId(editingId);
    }

    closePanel();
  };

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const statusLabel = (status) => {
    if (status === "Hidden")
      return t("products.status.hidden", "Hidden");
    if (status === "OutOfStock")
      return t("products.status.outOfStock", "Out of stock");
    return t("products.status.active", "Active");
  };

  return (
    <div className="products-container">
      {/* HEADER */}
      <div className="products-header">
        <div className="products-header-left">
          <h2>{t("products.title", "Products")}</h2>
          <p>{t("products.subtitle", "Manage your anime, manga and gaming items.")}</p>
        </div>

        <div className="products-header-right">
          <button className="add-product-btn" onClick={openAddPanel}>
            + {t("products.addProduct", "Add Product")}
          </button>

          <div className="products-filters">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="products-select"
            >
              <option value="all">
                {t("products.filterCategoryAll", "All categories")}
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="products-select"
            >
              <option value="all">
                {t("products.filterStatusAll", "All statuses")}
              </option>
              <option value="Active">
                {t("products.status.active", "Active")}
              </option>
              <option value="Hidden">
                {t("products.status.hidden", "Hidden")}
              </option>
              <option value="OutOfStock">
                {t("products.status.outOfStock", "Out of stock")}
              </option>
            </select>
          </div>

          <div className="products-search">
            <input
              type="text"
              placeholder={t(
                "products.searchPlaceholder",
                "Search by name, fandom, category..."
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="products-search-input"
            />
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="products-summary">
        <div className="products-summary-card">
          <span className="summary-label">
            {t("products.summary.totalProducts", "Total products")}
          </span>
          <span className="summary-value">{totalProducts}</span>
        </div>
        <div className="products-summary-card">
          <span className="summary-label">
            {t("products.summary.activeProducts", "Active")}
          </span>
          <span className="summary-value summary-active">
            {activeProducts}
          </span>
        </div>
        <div className="products-summary-card">
          <span className="summary-label">
            {t("products.summary.lowStock", "Low stock (≤5)")}
          </span>
          <span className="summary-value summary-low">
            {lowStockCount}
          </span>
        </div>
        <div className="products-summary-card">
          <span className="summary-label">
            {t("products.summary.outOfStock", "Out of stock")}
          </span>
          <span className="summary-value summary-out">
            {outOfStockCount}
          </span>
        </div>
        <div className="products-summary-card products-summary-wide">
          <span className="summary-label">
            {t("products.summary.inventoryValue", "Inventory value")}
          </span>
          <span className="summary-value summary-inventory">
            €{inventoryValue.toFixed(2)}
          </span>
        </div>
      </div>

      {/* META BAR */}
      <div className="products-meta-bar">
        <span className="products-meta-results">{resultsText}</span>
      </div>

      {/* MAIN CARD: TABLE + PANEL */}
      <div className={`products-main-card ${isPanelOpen ? "with-panel" : ""}`}>
        <div className="products-table-col">
          <table className="users-table products-table">
            <thead>
              <tr>
                <th
                  className="products-th-sortable"
                  onClick={() => handleSort("id")}
                >
                  <span>ID</span>
                  <span className="sort-indicator">
                    {renderSortIndicator("id")}
                  </span>
                </th>
                <th
                  className="products-th-sortable"
                  onClick={() => handleSort("name")}
                >
                  <span>{t("products.nameLabel", "Name")}</span>
                  <span className="sort-indicator">
                    {renderSortIndicator("name")}
                  </span>
                </th>
                <th
                  className="products-th-sortable"
                  onClick={() => handleSort("category")}
                >
                  <span>{t("products.categoryLabel", "Category")}</span>
                  <span className="sort-indicator">
                    {renderSortIndicator("category")}
                  </span>
                </th>
                <th>{t("products.fandomLabel", "Fandom")}</th>
                <th
                  className="products-th-sortable"
                  onClick={() => handleSort("price")}
                >
                  <span>{t("products.priceLabel", "Price (€)")}</span>
                  <span className="sort-indicator">
                    {renderSortIndicator("price")}
                  </span>
                </th>
                <th
                  className="products-th-sortable"
                  onClick={() => handleSort("stock")}
                >
                  <span>{t("products.stockLabel", "Stock")}</span>
                  <span className="sort-indicator">
                    {renderSortIndicator("stock")}
                  </span>
                </th>
                <th>{t("products.statusLabel", "Status")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="products-empty">
                    {t(
                      "products.empty",
                      "No products found for this filter."
                    )}
                  </td>
                </tr>
              ) : (
                sortedProducts.map((product) => {
                  let statusClass = "product-status-active";
                  if (product.status === "Hidden") {
                    statusClass = "product-status-hidden";
                  } else if (product.status === "OutOfStock") {
                    statusClass = "product-status-out";
                  }

                  const stockClass =
                    product.stock === 0
                      ? "stock-zero"
                      : product.stock <= 5
                      ? "stock-low"
                      : "stock-ok";

                  return (
                    <tr
                      key={product.id}
                      className={`products-row ${
                        selectedId === product.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedId(product.id)}
                    >
                      <td>#{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{product.fandom}</td>
                      <td>€{product.price.toFixed(2)}</td>
                      <td className={stockClass}>{product.stock}</td>
                      <td>
                        <span className={`product-status ${statusClass}`}>
                          {statusLabel(product.status)}
                        </span>
                      </td>
                      <td>
                        <div className="products-row-actions">
                          <button
                            className="products-edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditPanel(product);
                            }}
                          >
                            {t("products.editButton", "Edit")}
                          </button>
                          <button
                            className="products-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product.id);
                            }}
                          >
                            {t("products.deleteButton", "Delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {isPanelOpen && (
          <div className="products-panel">
            <div className="products-panel-header">
              <h3>
                {editingId == null
                  ? t("products.addProduct", "Add Product")
                  : t("products.editProduct", "Edit Product")}
              </h3>
              <button
                type="button"
                className="products-panel-close"
                onClick={closePanel}
              >
                ✕
              </button>
            </div>

            <div className="products-panel-grid">
              <div className="products-field">
                <label>{t("products.nameLabel", "Name")}</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="products-field">
                <label>{t("products.categoryLabel", "Category")}</label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="Figure, Manga, Poster..."
                />
              </div>

              <div className="products-field">
                <label>{t("products.fandomLabel", "Fandom")}</label>
                <input
                  type="text"
                  value={formFandom}
                  onChange={(e) => setFormFandom(e.target.value)}
                  placeholder="Naruto, One Piece..."
                />
              </div>

              <div className="products-field">
                <label>{t("products.priceLabel", "Price (€)")}</label>
                <input
                  type="number"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                />
              </div>

              <div className="products-field">
                <label>{t("products.stockLabel", "Stock")}</label>
                <input
                  type="number"
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                />
              </div>

              <div className="products-field">
                <label>{t("products.statusLabel", "Status")}</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {statusLabel(st)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="products-error">{error}</p>}

            <div className="products-panel-actions">
              <button className="btn-primary" onClick={handleSave}>
                {t("products.saveButton", "Save")}
              </button>
              <button className="btn-ghost" onClick={closePanel}>
                {t("products.cancelButton", "Cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
