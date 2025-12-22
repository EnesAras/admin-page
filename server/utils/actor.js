const HEADER_KEYS = {
  id: "x-actor-id",
  email: "x-actor-email",
  name: "x-actor-name",
  role: "x-actor-role",
};

const safeGetHeader = (req, key) => {
  if (!req || !req.headers) return null;
  const value = req.headers[key];
  if (Array.isArray(value)) {
    return value[0] || null;
  }
  return value ?? null;
};

const parseId = (value) => {
  if (value === null || value === undefined) return null;
  const loaded = Number(value);
  return Number.isFinite(loaded) ? loaded : null;
};

function getActorFromHeaders(req) {
  return {
    id: parseId(safeGetHeader(req, HEADER_KEYS.id)),
    email: safeGetHeader(req, HEADER_KEYS.email),
    name: safeGetHeader(req, HEADER_KEYS.name),
    role: safeGetHeader(req, HEADER_KEYS.role),
  };
}

module.exports = {
  getActorFromHeaders,
};
