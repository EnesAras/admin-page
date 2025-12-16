const API_SIMULATION = {
  enabled: process.env.REACT_APP_ENABLE_API_SIMULATION === "true",
  defaults: {
    minDelay: 120,
    maxDelay: 480,
    failureRate: 0.05,
  },
  routes: [
    {
      prefix: "/api/auth/login",
      failureRate: 0.1,
      minDelay: 300,
      maxDelay: 1000,
      message: "Simulated gateway timeout",
    },
    {
      prefix: "/api/dashboard",
      failureRate: 0.02,
      minDelay: 160,
      maxDelay: 640,
      message: "Simulated analytics timeout",
    },
  ],
};

const randomBetween = (min, max) =>
  Math.round(Math.random() * (max - min) + min);

const dispatchApiToast = ({ message, type = "info" }) => {
  if (!message || typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("api-toast", {
      detail: {
        message,
        type,
      },
    })
  );
};

const matchSimulation = (requestPath) => {
  if (!API_SIMULATION.enabled) return null;
  return API_SIMULATION.routes.find((route) =>
    requestPath.startsWith(route.prefix)
  );
};

const simulateNetwork = async (requestPath) => {
  if (!API_SIMULATION.enabled) return;
  const route = matchSimulation(requestPath);
  const target = {
    ...API_SIMULATION.defaults,
    ...(route || {}),
  };

  const delay = randomBetween(target.minDelay, target.maxDelay);
  const slowThreshold = target.maxDelay * 0.75;
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (delay >= slowThreshold) {
    dispatchApiToast({
      message:
        route?.slowMessage ||
        "Request is taking longer than expected; thanks for your patience.",
      type: "warning",
    });
  }

  if (Math.random() < target.failureRate) {
    const message = route?.message || "Simulated network error";
    dispatchApiToast({ message, type: "error" });
    throw new Error(message);
  }
};

export async function apiFetch(path, options = {}) {
  await simulateNetwork(path);

  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
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
    throw new Error(data?.error || data?.message || "Request failed");
  }

  return data;
}
