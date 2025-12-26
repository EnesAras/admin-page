const path = require("path");
const { loadDb, saveDb } = require("./persistence");

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DATA_PATH = path.resolve(__dirname, "db.json");

const persistedData = loadDb(DATA_PATH);
const storeId = persistedData?.__storeId || Math.random().toString(16).slice(2);

const ensureList = (key) => {
  if (persistedData && Array.isArray(persistedData[key])) {
    return persistedData[key];
  }
  return [];
};

const mockStore = {
  __storeId: storeId,
  users: ensureList("users"),
  orders: ensureList("orders"),
  products: ensureList("products"),
};

const persistStore = () => {
  try {
    saveDb(DATA_PATH, {
      __storeId: mockStore.__storeId,
      users: mockStore.users,
      orders: mockStore.orders,
      products: mockStore.products,
    });
  } catch (err) {
    console.error("Failed to persist mockStore:", err);
  }
};

persistStore();

module.exports = {
  mockStore,
  persistStore,
  MONTH_LABELS,
};
