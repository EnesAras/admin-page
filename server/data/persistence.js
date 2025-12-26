const fs = require("fs");

const loadDb = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("[persistence] loadDb error:", err);
    return null;
  }
};

const saveDb = (filePath, data) => {
  try {
    const serialized = JSON.stringify(data, null, 2);
    fs.mkdirSync(require("path").dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, serialized, "utf8");
  } catch (err) {
    console.error("[persistence] saveDb error:", err);
  }
};

module.exports = {
  loadDb,
  saveDb,
};
