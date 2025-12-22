  // src/pages/ProductsPage.jsx
  import { useState, useEffect, useMemo } from "react";
  import "./ProductsPage.css";
  import { useSettings } from "../context/SettingsContext";
  import translations from "../i18n/translations";
  import { apiFetch } from "../lib/api";


  const statusOptions = ["Active", "Hidden", "OutOfStock"];

  const normalizeProductsPayload = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.products)) return data.products;
    return [];
  };

  function ProductsPage({ language }) {
    const { settings, language: ctxLanguage } = useSettings();

    const lang = language || ctxLanguage || settings?.language || "en";
    const dict = translations[lang] || translations.en;

    const t = (key, fallback) => {
      if (dict && dict[key] !== undefined) return dict[key];
      if (translations.en && translations.en[key] !== undefined) return translations.en[key];
      if (fallback !== undefined) return fallback;
      return key;
    };

    // ========== STATE ==========
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [selectedId, setSelectedId] = useState(null);

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form state (her zaman string başlar)
    const [formName, setFormName] = useState("");
    const [formCategory, setFormCategory] = useState("");
    const [formFandom, setFormFandom] = useState("");
    const [formPrice, setFormPrice] = useState("");
    const [formStock, setFormStock] = useState("");
    const [formStatus, setFormStatus] = useState("Active");
    const [formError, setFormError] = useState("");


    // ========== BACKEND'TEN VERİ ÇEK ==========
    useEffect(() => {
      async function fetchProducts() {
        try {
          setLoading(true);
          setFetchError(null);

          const data = await apiFetch("/api/products");
          setProducts(normalizeProductsPayload(data));
        } catch (err) {
          console.error(err);
          setFetchError("FETCH_PRODUCTS_FAILED");

        } finally {
          setLoading(false);
        }
      }

      fetchProducts();
    }, [lang]);

    // categories (safe)
    const categories = useMemo(() => {
      return Array.from(new Set(products.map((p) => p?.category).filter(Boolean)));
    }, [products]);

    // === METRICS (safe) ===
    const totalProducts = products.length;

    const activeProducts = useMemo(
      () => products.filter((p) => (p?.status ?? "Active") === "Active").length,
      [products]
    );

    // ✅ LOW STOCK: (<5) -> 1..4
    const lowStockCount = useMemo(
      () =>
        products.filter((p) => {
          const stock = Number(p?.stock ?? 0);
          return stock > 0 && stock < 5;
        }).length,
      [products]
    );

    const outOfStockCount = useMemo(
      () => products.filter((p) => Number(p?.stock ?? 0) === 0).length,
      [products]
    );

    const inventoryValue = useMemo(
      () =>
        products.reduce((sum, p) => {
          const price = Number(p?.price ?? 0);
          const stock = Number(p?.stock ?? 0);
          return sum + price * stock;
        }, 0),
      [products]
    );

    // helper sadece sonuç metni için (safe)
    function filteredProductsLength(list, { searchTerm, statusFilter, categoryFilter }) {
      const term = String(searchTerm ?? "").toLowerCase().trim();

      return list.filter((product) => {
        const name = String(product?.name ?? "").toLowerCase();
        const fandom = String(product?.fandom ?? "").toLowerCase();
        const category = String(product?.category ?? "").toLowerCase();

        const matchesSearch =
          term === "" || name.includes(term) || fandom.includes(term) || category.includes(term);

        const status = String(product?.status ?? "Active");
        const matchesStatus = statusFilter === "all" || status === statusFilter;

        const cat = String(product?.category ?? "");
        const matchesCategory = categoryFilter === "all" || cat === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      }).length;
    }

    const currentCount = filteredProductsLength(products, {
      searchTerm,
      statusFilter,
      categoryFilter,
    });

    const resultsTemplate = t("products.resultsSummary", "Showing {current} of {total} products");
    const resultsText = resultsTemplate
      .replace("{current}", String(currentCount))
      .replace("{total}", String(totalProducts));

    // === FILTERED + SORTED LIST (safe) ===
    const filteredProducts = useMemo(() => {
      const term = String(searchTerm ?? "").toLowerCase().trim();

      return products.filter((product) => {
        const name = String(product?.name ?? "").toLowerCase();
        const fandom = String(product?.fandom ?? "").toLowerCase();
        const category = String(product?.category ?? "").toLowerCase();

        const matchesSearch =
          term === "" || name.includes(term) || fandom.includes(term) || category.includes(term);

        const status = String(product?.status ?? "Active");
        const matchesStatus = statusFilter === "all" || status === statusFilter;

        const cat = String(product?.category ?? "");
        const matchesCategory = categoryFilter === "all" || cat === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      });
    }, [products, searchTerm, statusFilter, categoryFilter]);

    const sortedProducts = useMemo(() => {
      return [...filteredProducts].sort((a, b) => {
        let valA;
        let valB;

        switch (sortBy) {
          case "id":
            valA = Number(a?.id ?? 0);
            valB = Number(b?.id ?? 0);
            break;
          case "name":
            valA = String(a?.name ?? "").toLowerCase();
            valB = String(b?.name ?? "").toLowerCase();
            break;
          case "category":
            valA = String(a?.category ?? "").toLowerCase();
            valB = String(b?.category ?? "").toLowerCase();
            break;
          case "price":
            valA = Number(a?.price ?? 0);
            valB = Number(b?.price ?? 0);
            break;
          case "stock":
            valA = Number(a?.stock ?? 0);
            valB = Number(b?.stock ?? 0);
            break;
          default:
            valA = 0;
            valB = 0;
        }

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }, [filteredProducts, sortBy, sortDirection]);

    const handleSort = (key) => {
      setSortBy((prevKey) => {
        if (prevKey === key) {
          setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
          return prevKey;
        }
        setSortDirection(key === "name" ? "asc" : "desc");
        return key;
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
      setFormError("");
    };

    // ✅ crash-proof edit open
    const openEditPanel = (product) => {
      setIsPanelOpen(true);
      setEditingId(product?.id ?? null);

      setFormName(String(product?.name ?? ""));
      setFormCategory(String(product?.category ?? ""));
      setFormFandom(String(product?.fandom ?? ""));
      setFormPrice(String(product?.price ?? ""));
      setFormStock(String(product?.stock ?? ""));
      setFormStatus(product?.status ?? "Active");

      setFormError("");
    };

    const closePanel = () => {
      setIsPanelOpen(false);
      setEditingId(null);
      setFormError("");
    };

// ✅ save -> backend (POST / PUT)
const handleSave = async () => {
  setFormError("");

  const safeName = String(formName ?? "").trim();
  if (!safeName) {
    setFormError(t("products.error.nameRequired", "Name is required."));
    return;
  }

  const priceValue = Number(formPrice);
  if (!Number.isFinite(priceValue) || priceValue < 0) {
    setFormError(t("products.error.priceInvalid", "Enter a valid price."));
    return;
  }

  const stockValue = Number(formStock);
  if (!Number.isInteger(stockValue) || stockValue < 0) {
    setFormError(t("products.error.stockInvalid", "Stock must be 0 or higher."));
    return;
  }

    const payload = {
      name: safeName,
      category: String(formCategory ?? "").trim() || "Other",
      fandom: String(formFandom ?? "").trim() || "General",
      price: priceValue,
      stock: stockValue,
      status: String(formStatus ?? "Active"),
    };

    try {
      const isEdit = editingId != null;
      const baseUrl = "/api/products";
      const url = isEdit ? `${baseUrl}/${Number(editingId)}` : baseUrl;

      const saved = await apiFetch(url, {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      if (isEdit) {
        setProducts((prev) =>
          prev.map((p) => (Number(p?.id) === Number(editingId) ? saved : p))
        );
        setSelectedId(Number(editingId));
      } else {
        setProducts((prev) => [saved, ...prev]);
        setSelectedId(Number(saved?.id));
      }

      closePanel();
    } catch (err) {
      console.error(err);
      setFormError(
        err?.message ||
          t("products.error.generic", "Something went wrong. Please try again.")
      );
    }
};


const handleDelete = async (id) => {
  const safeId = Number(id);
  if (!Number.isFinite(safeId)) return;

  try {
    await apiFetch(`/api/products/${safeId}`, {
      method: "DELETE",
    });

    setProducts((prev) => prev.filter((p) => Number(p?.id) !== safeId));
    if (Number(selectedId) === safeId) setSelectedId(null);
  } catch (err) {
    console.error(err);
  }
};


    const statusLabel = (status) => {
      if (status === "Hidden") return t("products.status.hidden", "Hidden");
      if (status === "OutOfStock") return t("products.status.outOfStock", "Out of stock");
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
                <option value="all">{t("products.filterCategoryAll", "All categories")}</option>
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
                <option value="all">{t("products.filterStatusAll", "All statuses")}</option>
                <option value="Active">{t("products.status.active", "Active")}</option>
                <option value="Hidden">{t("products.status.hidden", "Hidden")}</option>
                <option value="OutOfStock">{t("products.status.outOfStock", "Out of stock")}</option>
              </select>
            </div>

            <div className="products-search">
              <input
                type="text"
                placeholder={t("products.searchPlaceholder", "Search by name, fandom, category...")}
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
            <span className="summary-value summary-active">{activeProducts}</span>
          </div>

          <div className="products-summary-card">
            <span className="summary-label">
              {t("products.summary.lowStock", "Low stock (<5)")}
            </span>
            <span className="summary-value summary-low">{lowStockCount}</span>
          </div>

          <div className="products-summary-card">
            <span className="summary-label">
              {t("products.summary.outOfStock", "Out of stock")}
            </span>
            <span className="summary-value summary-out">{outOfStockCount}</span>
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

        {/* LOADING & ERROR */}
        {loading && (
          <div className="products-loading">{t("products.loading", "Loading products...")}</div>
        )}
  {fetchError && !loading && (
    <div className="products-error-fetch">
      {fetchError === "FETCH_PRODUCTS_FAILED"
        ? t("products.fetchError", "There was a problem loading products. Please try again.")
        : fetchError}
    </div>
  )}

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
                  <th className="products-th-sortable" onClick={() => handleSort("id")}>
                    <span>ID</span>
                    <span className="sort-indicator">{renderSortIndicator("id")}</span>
                  </th>
                  <th className="products-th-sortable" onClick={() => handleSort("name")}>
                    <span>{t("products.nameLabel", "Name")}</span>
                    <span className="sort-indicator">{renderSortIndicator("name")}</span>
                  </th>
                  <th className="products-th-sortable" onClick={() => handleSort("category")}>
                    <span>{t("products.categoryLabel", "Category")}</span>
                    <span className="sort-indicator">{renderSortIndicator("category")}</span>
                  </th>
                  <th>{t("products.fandomLabel", "Fandom")}</th>
                  <th className="products-th-sortable" onClick={() => handleSort("price")}>
                    <span>{t("products.priceLabel", "Price (€)")}</span>
                    <span className="sort-indicator">{renderSortIndicator("price")}</span>
                  </th>
                  <th className="products-th-sortable" onClick={() => handleSort("stock")}>
                    <span>{t("products.stockLabel", "Stock")}</span>
                    <span className="sort-indicator">{renderSortIndicator("stock")}</span>
                  </th>
                  <th>{t("products.statusLabel", "Status")}</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {sortedProducts.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="8" className="products-empty">
                      {t("products.empty", "No products found for this filter.")}
                    </td>
                  </tr>
                ) : (
                  sortedProducts.map((product) => {
                    const status = product?.status ?? "Active";

                    let statusClass = "product-status-active";
                    if (status === "Hidden") statusClass = "product-status-hidden";
                    else if (status === "OutOfStock") statusClass = "product-status-out";

                    const stockNum = Number(product?.stock ?? 0);

                    // ✅ LOW STOCK CLASS: (<5)
                    const stockClass =
                      stockNum === 0 ? "stock-zero" : stockNum < 5 ? "stock-low" : "stock-ok";

                    return (
                      <tr
                        key={product?.id}
                        className={`products-row ${selectedId === product?.id ? "selected" : ""}`}
                        onClick={() => setSelectedId(product?.id)}
                      >
                        <td>#{product?.id ?? "-"}</td>
                        <td>{product?.name ?? "-"}</td>
                        <td>{product?.category ?? "-"}</td>
                        <td>{product?.fandom ?? "-"}</td>
                        <td>€{Number(product?.price ?? 0).toFixed(2)}</td>
                        <td className={stockClass}>{stockNum}</td>
                        <td>
                          <span className={`product-status ${statusClass}`}>{statusLabel(status)}</span>
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
                                handleDelete(product?.id);
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

                <button type="button" className="products-panel-close" onClick={closePanel}>
                  ✕
                </button>
              </div>

              <div className="products-panel-grid">
                <div className="products-field">
                  <label>{t("products.nameLabel", "Name")}</label>
                  <input
                    type="text"
                    value={formName ?? ""}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className="products-field">
                  <label>{t("products.categoryLabel", "Category")}</label>
                  <input
                    type="text"
                    value={formCategory ?? ""}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Figure, Manga, Poster..."
                  />
                </div>

                <div className="products-field">
                  <label>{t("products.fandomLabel", "Fandom")}</label>
                  <input
                    type="text"
                    value={formFandom ?? ""}
                    onChange={(e) => setFormFandom(e.target.value)}
                    placeholder="Naruto, One Piece..."
                  />
                </div>

                <div className="products-field">
                  <label>{t("products.priceLabel", "Price (€)")}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPrice ?? ""}
                    onChange={(e) => setFormPrice(e.target.value)}
                  />
                </div>

                <div className="products-field">
                  <label>{t("products.stockLabel", "Stock")}</label>
                  <input
                    type="number"
                    value={formStock ?? ""}
                    onChange={(e) => setFormStock(e.target.value)}
                  />
                </div>

                <div className="products-field">
                  <label>{t("products.statusLabel", "Status")}</label>
                  <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                    {statusOptions.map((st) => (
                      <option key={st} value={st}>
                        {statusLabel(st)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formError && <p className="products-error">{formError}</p>}

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
