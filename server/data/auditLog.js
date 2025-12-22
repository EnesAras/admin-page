const AUDIT_LOG_MAX = 300;
const auditEntries = [];
let auditIdCounter = 1;

const normalizeActor = (actor) => {
  if (!actor || typeof actor !== "object") {
    return { id: null, name: null, email: null, role: null };
  }
  return {
    id: actor.id ?? null,
    name: actor.name ?? null,
    email: actor.email ?? null,
    role: actor.role ?? null,
  };
};

function logAuditEvent({
  actor,
  action,
  entityType = null,
  entityId = null,
  meta = null,
} = {}) {
  if (!action) {
    throw new Error("Audit event must specify an action string.");
  }

  const entry = {
    id: auditIdCounter++,
    ts: Date.now(),
    actor: normalizeActor(actor),
    action,
    entityType,
    entityId,
    meta,
  };

  auditEntries.unshift(entry);
  if (auditEntries.length > AUDIT_LOG_MAX) {
    auditEntries.length = AUDIT_LOG_MAX;
  }

  return entry;
}

function listAuditEvents(limit = 10) {
  const parsedLimit = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(limit, 50)) : 10;
  return auditEntries.slice(0, parsedLimit);
}

module.exports = {
  logAuditEvent,
  listAuditEvents,
};
