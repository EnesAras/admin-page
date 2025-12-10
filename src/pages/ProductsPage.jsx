// src/pages/ProductsPage.jsx
import { useState, useEffect } from "react";
import "./ProductsPage.css";
import { useSettings } from "../context/SettingsContext";

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

const productTexts = {
  en: {
    title: "Products",
    subtitle: "Manage your anime, manga and gaming items.",
    addProduct: "Add Product",
    editProduct: "Edit Product",
    nameLabel: "Name",
    categoryLabel: "Category",
    fandomLabel: "Fandom",
    priceLabel: "Price (€)",
    stockLabel: "Stock",
    statusLabel: "Status",
    searchPlaceholder: "Search by name, fandom, category...",
    filterAll: "All",
    filterCategoryAll: "All categories",
    filterStatusAll: "All statuses",
    statusActive: "Active",
    statusHidden: "Hidden",
    statusOutOfStock: "Out of stock",
    saveButton: "Save",
    cancelButton: "Cancel",
    editButton: "Edit",
    deleteButton: "Delete",
    empty: "No products found for this filter.",
    errorNameRequired: "Name is required.",
    errorPriceInvalid: "Enter a valid price.",
    errorStockInvalid: "Stock must be 0 or higher.",
    // NEW texts
    summaryTotalProducts: "Total products",
    summaryActiveProducts: "Active",
    summaryLowStock: "Low stock (≤5)",
    summaryOutOfStock: "Out of stock",
    summaryInventoryValue: "Inventory value",
    resultsSummary: "Showing {current} of {total} products",
  },
  tr: {
    title: "Ürünler",
    subtitle: "Anime, manga ve gaming ürünlerini yönet.",
    addProduct: "Ürün Ekle",
    editProduct: "Ürünü Düzenle",
    nameLabel: "İsim",
    categoryLabel: "Kategori",
    fandomLabel: "Evren",
    priceLabel: "Fiyat (€)",
    stockLabel: "Stok",
    statusLabel: "Durum",
    searchPlaceholder: "İsim, evren veya kategori ile ara...",
    filterAll: "Hepsi",
    filterCategoryAll: "Tüm kategoriler",
    filterStatusAll: "Tüm durumlar",
    statusActive: "Aktif",
    statusHidden: "Gizli",
    statusOutOfStock: "Stokta yok",
    saveButton: "Kaydet",
    cancelButton: "İptal",
    editButton: "Düzenle",
    deleteButton: "Sil",
    empty: "Bu filtreye uygun ürün bulunamadı.",
    errorNameRequired: "İsim zorunludur.",
    errorPriceInvalid: "Geçerli bir fiyat gir.",
    errorStockInvalid: "Stok 0 veya daha büyük olmalı.",
    summaryTotalProducts: "Toplam ürün",
    summaryActiveProducts: "Aktif",
    summaryLowStock: "Düşük stok (≤5)",
    summaryOutOfStock: "Stokta yok",
    summaryInventoryValue: "Stok değeri",
    resultsSummary:
      "Toplam {total} üründen {current} tanesi görüntüleniyor",
  },
  es: {
    title: "Productos",
    subtitle: "Gestiona tus productos de anime, manga y gaming.",
    addProduct: "Añadir producto",
    editProduct: "Editar producto",
    nameLabel: "Nombre",
    categoryLabel: "Categoría",
    fandomLabel: "Universo",
    priceLabel: "Precio (€)",
    stockLabel: "Stock",
    statusLabel: "Estado",
    searchPlaceholder: "Buscar por nombre, universo, categoría...",
    filterAll: "Todos",
    filterCategoryAll: "Todas las categorías",
    filterStatusAll: "Todos los estados",
    statusActive: "Activo",
    statusHidden: "Oculto",
    statusOutOfStock: "Sin stock",
    saveButton: "Guardar",
    cancelButton: "Cancelar",
    editButton: "Editar",
    deleteButton: "Eliminar",
    empty: "No se encontraron productos para este filtro.",
    errorNameRequired: "El nombre es obligatorio.",
    errorPriceInvalid: "Introduce un precio válido.",
    errorStockInvalid: "El stock debe ser 0 o mayor.",
    summaryTotalProducts: "Productos totales",
    summaryActiveProducts: "Activos",
    summaryLowStock: "Bajo stock (≤5)",
    summaryOutOfStock: "Sin stock",
    summaryInventoryValue: "Valor del inventario",
    resultsSummary: "Mostrando {current} de {total} productos",
  },
  de: {
    title: "Produkte",
    subtitle: "Verwalte deine Anime-, Manga- und Gaming-Artikel.",
    addProduct: "Produkt hinzufügen",
    editProduct: "Produkt bearbeiten",
    nameLabel: "Name",
    categoryLabel: "Kategorie",
    fandomLabel: "Universum",
    priceLabel: "Preis (€)",
    stockLabel: "Bestand",
    statusLabel: "Status",
    searchPlaceholder:
      "Nach Name, Universum oder Kategorie suchen...",
    filterAll: "Alle",
    filterCategoryAll: "Alle Kategorien",
    filterStatusAll: "Alle Status",
    statusActive: "Aktiv",
    statusHidden: "Versteckt",
    statusOutOfStock: "Nicht auf Lager",
    saveButton: "Speichern",
    cancelButton: "Abbrechen",
    editButton: "Bearbeiten",
    deleteButton: "Löschen",
    empty: "Für diesen Filter wurden keine Produkte gefunden.",
    errorNameRequired: "Name ist erforderlich.",
    errorPriceInvalid: "Gib einen gültigen Preis ein.",
    errorStockInvalid:
      "Bestand muss 0 oder größer sein.",
    summaryTotalProducts: "Gesamtprodukte",
    summaryActiveProducts: "Aktiv",
    summaryLowStock: "Niedriger Bestand (≤5)",
    summaryOutOfStock: "Nicht auf Lager",
    summaryInventoryValue: "Lagerwert",
    resultsSummary:
      "Zeige {current} von {total} Produkten",
  },
  fr: {
    title: "Produits",
    subtitle:
      "Gérez vos articles d’anime, de manga et de gaming.",
    addProduct: "Ajouter un produit",
    editProduct: "Modifier le produit",
    nameLabel: "Nom",
    categoryLabel: "Catégorie",
    fandomLabel: "Univers",
    priceLabel: "Prix (€)",
    stockLabel: "Stock",
    statusLabel: "Statut",
    searchPlaceholder:
      "Rechercher par nom, univers, catégorie...",
    filterAll: "Tous",
    filterCategoryAll: "Toutes les catégories",
    filterStatusAll: "Tous les statuts",
    statusActive: "Actif",
    statusHidden: "Masqué",
    statusOutOfStock: "Rupture de stock",
    saveButton: "Enregistrer",
    cancelButton: "Annuler",
    editButton: "Modifier",
    deleteButton: "Supprimer",
    empty: "Aucun produit trouvé pour ce filtre.",
    errorNameRequired: "Le nom est obligatoire.",
    errorPriceInvalid: "Saisissez un prix valide.",
    errorStockInvalid:
      "Le stock doit être supérieur ou égal à 0.",
    summaryTotalProducts: "Produits totaux",
    summaryActiveProducts: "Actifs",
    summaryLowStock: "Stock faible (≤5)",
    summaryOutOfStock: "Rupture de stock",
    summaryInventoryValue: "Valeur du stock",
    resultsSummary:
      "Affichage de {current} sur {total} produits",
  },
  it: {
    title: "Prodotti",
    subtitle:
      "Gestisci i tuoi articoli anime, manga e gaming.",
    addProduct: "Aggiungi prodotto",
    editProduct: "Modifica prodotto",
    nameLabel: "Nome",
    categoryLabel: "Categoria",
    fandomLabel: "Universo",
    priceLabel: "Prezzo (€)",
    stockLabel: "Stock",
    statusLabel: "Stato",
    searchPlaceholder:
      "Cerca per nome, universo, categoria...",
    filterAll: "Tutti",
    filterCategoryAll: "Tutte le categorie",
    filterStatusAll: "Tutti gli stati",
    statusActive: "Attivo",
    statusHidden: "Nascosto",
    statusOutOfStock: "Esaurito",
    saveButton: "Salva",
    cancelButton: "Annulla",
    editButton: "Modifica",
    deleteButton: "Elimina",
    empty: "Nessun prodotto trovato per questo filtro.",
    errorNameRequired: "Il nome è obbligatorio.",
    errorPriceInvalid: "Inserisci un prezzo valido.",
    errorStockInvalid:
      "Lo stock deve essere 0 o maggiore.",
    summaryTotalProducts: "Prodotti totali",
    summaryActiveProducts: "Attivi",
    summaryLowStock: "Scorte basse (≤5)",
    summaryOutOfStock: "Esauriti",
    summaryInventoryValue: "Valore dell'inventario",
    resultsSummary:
      "Visualizzazione di {current} su {total} prodotti",
  },
  ru: {
    title: "Товары",
    subtitle:
      "Управляйте товарами по аниме, манге и играм.",
    addProduct: "Добавить товар",
    editProduct: "Редактировать товар",
    nameLabel: "Название",
    categoryLabel: "Категория",
    fandomLabel: "Вселенная",
    priceLabel: "Цена (€)",
    stockLabel: "Остаток",
    statusLabel: "Статус",
    searchPlaceholder:
      "Поиск по названию, вселенной, категории...",
    filterAll: "Все",
    filterCategoryAll: "Все категории",
    filterStatusAll: "Все статусы",
    statusActive: "Активен",
    statusHidden: "Скрыт",
    statusOutOfStock: "Нет в наличии",
    saveButton: "Сохранить",
    cancelButton: "Отмена",
    editButton: "Изменить",
    deleteButton: "Удалить",
    empty: "Для этого фильтра товары не найдены.",
    errorNameRequired: "Название обязательно.",
    errorPriceInvalid: "Введите корректную цену.",
    errorStockInvalid:
      "Остаток должен быть 0 или больше.",
    summaryTotalProducts: "Всего товаров",
    summaryActiveProducts: "Активные",
    summaryLowStock: "Малый остаток (≤5)",
    summaryOutOfStock: "Нет в наличии",
    summaryInventoryValue: "Стоимость склада",
    resultsSummary:
      "Показано {current} из {total} товаров",
  },
};

const statusOptions = ["Active", "Hidden", "OutOfStock"];

function ProductsPage({ language }) {
  const { settings, language: ctxLanguage } = useSettings();

  // Dil önceliği: prop > context.language > settings.language > "en"
  const currentLang = language || ctxLanguage || settings?.language || "en";
  const t = productTexts[currentLang] || productTexts.en;

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
  const activeProducts = products.filter(
    (p) => p.status === "Active"
  ).length;
  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= 5
  ).length;
  const outOfStockCount = products.filter(
    (p) => p.stock === 0
  ).length;
  const inventoryValue = products.reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  );

  const resultsText = t.resultsSummary
    .replace("{current}", String(
      products.length ? filteredProductsLength(products, {
        searchTerm,
        statusFilter,
        categoryFilter,
      }) : 0
    ))
    .replace("{total}", String(totalProducts));

  // helper sadece sonuç metni için
  function filteredProductsLength(
    list,
    { searchTerm, statusFilter, categoryFilter }
  ) {
    const term = searchTerm.toLowerCase().trim();
    return list.filter((product) => {
      const matchesSearch =
        term === "" ||
        product.name.toLowerCase().includes(term) ||
        product.fandom.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        product.status === statusFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        product.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    }).length;
  }

  // === FILTERED + SORTED LIST ===
  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase().trim();

    const matchesSearch =
      term === "" ||
      product.name.toLowerCase().includes(term) ||
      product.fandom.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === "all" ||
      product.status === statusFilter;

    const matchesCategory =
      categoryFilter === "all" ||
      product.category === categoryFilter;

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
        setSortDirection((prevDir) =>
          prevDir === "asc" ? "desc" : "asc"
        );
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
      setError(t.errorNameRequired);
      return;
    }

    const priceValue = Number(formPrice);
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setError(t.errorPriceInvalid);
      return;
    }

    const stockValue = Number(formStock);
    if (!Number.isInteger(stockValue) || stockValue < 0) {
      setError(t.errorStockInvalid);
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
        prev.map((p) =>
          p.id === editingId ? { ...p, ...payload } : p
        )
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

  

  return (
    <div className="products-container">
      {/* HEADER */}
      <div className="products-header">
        <div className="products-header-left">
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
        </div>

        <div className="products-header-right">
          <button
            className="add-product-btn"
            onClick={openAddPanel}
          >
            + {t.addProduct}
          </button>

          <div className="products-filters">
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
              className="products-select"
            >
              <option value="all">
                {t.filterCategoryAll}
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="products-select"
            >
              <option value="all">
                {t.filterStatusAll}
              </option>
              <option value="Active">
                {t.statusActive}
              </option>
              <option value="Hidden">
                {t.statusHidden}
              </option>
              <option value="OutOfStock">
                {t.statusOutOfStock}
              </option>
            </select>
          </div>

          <div className="products-search">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="products-search-input"
            />
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="products-summary">
        <div className="products-summary-card">
          <span className="summary-label">
            {t.summaryTotalProducts}
          </span>
          <span className="summary-value">
            {totalProducts}
          </span>
        </div>
        <div className="products-summary-card">
          <span className="summary-label">
            {t.summaryActiveProducts}
          </span>
          <span className="summary-value summary-active">
            {activeProducts}
          </span>
        </div>
        <div className="products-summary-card">
          <span className="summary-label">
            {t.summaryLowStock}
          </span>
          <span className="summary-value summary-low">
            {lowStockCount}
          </span>
        </div>
        <div className="products-summary-card">
          <span className="summary-label">
            {t.summaryOutOfStock}
          </span>
          <span className="summary-value summary-out">
            {outOfStockCount}
          </span>
        </div>
        <div className="products-summary-card products-summary-wide">
          <span className="summary-label">
            {t.summaryInventoryValue}
          </span>
          <span className="summary-value summary-inventory">
            €{inventoryValue.toFixed(2)}
          </span>
        </div>
      </div>

      {/* META BAR */}
      <div className="products-meta-bar">
        <span className="products-meta-results">
          {resultsText}
        </span>
      </div>

      {/* MAIN CARD: TABLE + PANEL */}
      <div
        className={`products-main-card ${
          isPanelOpen ? "with-panel" : ""
        }`}
      >
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
                  <span>{t.nameLabel}</span>
                  <span className="sort-indicator">
                    {renderSortIndicator("name")}
                  </span>
                </th>
                <th
                  className="products-th-sortable"
                  onClick={() => handleSort("category")}
                >
                  <span>{t.categoryLabel}</span>
                  <span className="sort-indicator">
                    {renderSortIndicator("category")}
                  </span>
                </th>
                <th>{t.fandomLabel}</th>
                <th
                  className="products-th-sortable"
                  onClick={() => handleSort("price")}
                >
                  <span>{t.priceLabel}</span>
                  <span className="sort-indicator">
                    {renderSortIndicator("price")}
                  </span>
                </th>
                <th
                  className="products-th-sortable"
                  onClick={() => handleSort("stock")}
                >
                  <span>{t.stockLabel}</span>
                  <span className="sort-indicator">
                    {renderSortIndicator("stock")}
                  </span>
                </th>
                <th>{t.statusLabel}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="products-empty"
                  >
                    {t.empty}
                  </td>
                </tr>
              ) : (
                sortedProducts.map((product) => {
                  let statusClass =
                    "product-status-active";
                  if (product.status === "Hidden") {
                    statusClass =
                      "product-status-hidden";
                  } else if (
                    product.status === "OutOfStock"
                  ) {
                    statusClass = "product-status-out";
                  }

                  let statusLabel = t.statusActive;
                  if (product.status === "Hidden") {
                    statusLabel = t.statusHidden;
                  } else if (
                    product.status === "OutOfStock"
                  ) {
                    statusLabel = t.statusOutOfStock;
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
                        selectedId === product.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedId(product.id)
                      }
                    >
                      <td>#{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{product.fandom}</td>
                      <td>
                        €{product.price.toFixed(2)}
                      </td>
                      <td className={stockClass}>
                        {product.stock}
                      </td>
                      <td>
                        <span
                          className={`product-status ${statusClass}`}
                        >
                          {statusLabel}
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
                            {t.editButton}
                          </button>
                          <button
                            className="products-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product.id);
                            }}
                          >
                            {t.deleteButton}
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
                  ? t.addProduct
                  : t.editProduct}
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
                <label>{t.nameLabel}</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) =>
                    setFormName(e.target.value)
                  }
                />
              </div>

              <div className="products-field">
                <label>{t.categoryLabel}</label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) =>
                    setFormCategory(e.target.value)
                  }
                  placeholder="Figure, Manga, Poster..."
                />
              </div>

              <div className="products-field">
                <label>{t.fandomLabel}</label>
                <input
                  type="text"
                  value={formFandom}
                  onChange={(e) =>
                    setFormFandom(e.target.value)
                  }
                  placeholder="Naruto, One Piece..."
                />
              </div>

              <div className="products-field">
                <label>{t.priceLabel}</label>
                <input
                  type="number"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) =>
                    setFormPrice(e.target.value)
                  }
                />
              </div>

              <div className="products-field">
                <label>{t.stockLabel}</label>
                <input
                  type="number"
                  value={formStock}
                  onChange={(e) =>
                    setFormStock(e.target.value)
                  }
                />
              </div>

              <div className="products-field">
                <label>{t.statusLabel}</label>
                <select
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value)
                  }
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st === "Active"
                        ? t.statusActive
                        : st === "Hidden"
                        ? t.statusHidden
                        : t.statusOutOfStock}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p className="products-error">{error}</p>
            )}

            <div className="products-panel-actions">
              <button
                className="btn-primary"
                onClick={handleSave}
              >
                {t.saveButton}
              </button>
              <button
                className="btn-ghost"
                onClick={closePanel}
              >
                {t.cancelButton}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
