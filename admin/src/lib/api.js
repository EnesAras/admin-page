export async function apiFetch(path, options = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedHeaders = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
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
