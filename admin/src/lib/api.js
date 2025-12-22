const TOAST_DEDUPE_WINDOW = 4500;
const toastTimestamps = new Map();
const STORAGE_USER_KEY = "admin_currentUser";

const readStoredUser = () => {
  if (
    typeof window === "undefined" ||
    typeof window.sessionStorage === "undefined"
  ) {
    return null;
  }

  try {
    const stored = window.sessionStorage.getItem(STORAGE_USER_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const buildActorHeaders = (user) => {
  if (!user || typeof user !== "object") return {};
  const headers = {};
  if (user.id !== undefined && user.id !== null) {
    headers["x-actor-id"] = String(user.id);
  }
  if (user.email) {
    headers["x-actor-email"] = user.email;
  }
  if (user.name) {
    headers["x-actor-name"] = user.name;
  }
  if (user.role) {
    headers["x-actor-role"] = user.role;
  }
  return headers;
};

export async function apiFetch(path, options = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedHeaders = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...buildActorHeaders(readStoredUser()),
  };
  const bodyPayload =
    options.body != null && typeof options.body !== "string"
      ? JSON.stringify(options.body)
      : options.body;

  const res = await fetch(normalizedPath, {
    ...options,
    body: bodyPayload,
    headers: normalizedHeaders,
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    console.error(
      "[apiFetch] error",
      normalizedPath,
      res.status,
      data ?? text ?? "no body"
    );
    throw new Error(data?.error || data?.message || "Request failed");
  }

  return data;
}

export function emitApiToast(detail = {}) {
  if (typeof window === "undefined") return null;

  const { message, type = "info" } = detail;
  if (!message) return null;

  const now = Date.now();
  for (const [key, timestamp] of toastTimestamps.entries()) {
    if (now - timestamp > TOAST_DEDUPE_WINDOW) {
      toastTimestamps.delete(key);
    }
  }

  const dedupeKey =
    detail?.dedupeKey || detail?.key || `${type}:${String(message)}`;

  if (type !== "error") {
    const lastTimestamp = toastTimestamps.get(dedupeKey);
    if (lastTimestamp && now - lastTimestamp < TOAST_DEDUPE_WINDOW) {
      return null;
    }
  }

  toastTimestamps.set(dedupeKey, now);
  const event = new CustomEvent("api-toast", {
    detail: { ...detail, timestamp: now },
  });
  window.dispatchEvent(event);
  return dedupeKey;
}
