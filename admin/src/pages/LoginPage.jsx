import "./LoginPage.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import translations from "../i18n/translations";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { language = "en", colorMode = "dark" } = useSettings();
  const { login } = useAuth();

  const dict = translations[language] || translations.en;

  const t = (key, fallback) => {
    if (dict && dict[key] !== undefined) return dict[key];
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key];
    }
    if (fallback !== undefined) return fallback;
    return key;
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [latencyMs, setLatencyMs] = useState(null);
  const [latencyStatus, setLatencyStatus] = useState("idle"); // idle | measuring | success | offline
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalUsers: null,
    activeUsers: null,
    inactiveUsers: null,
    adminUsers: null,
  });
  const [metricsStatus, setMetricsStatus] = useState("idle"); // idle | loading | success | error
  const measurementsRef = useRef([]);
  const latencyTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  const LATENCY_ENDPOINT = "/api/health";
  const LATENCY_WINDOW = 10;
  const LATENCY_INTERVAL = 45000;
  const LATENCY_TIMEOUT = 4500;
  const DASHBOARD_ENDPOINT = "/api/dashboard";

  // Saat'e göre selamlama
  const hour = new Date().getHours();
  let greetingKey = "login.greetingDefault";
  if (hour >= 5 && hour < 12) greetingKey = "login.greetingMorning";
  else if (hour >= 12 && hour < 18) greetingKey = "login.greetingAfternoon";
  else greetingKey = "login.greetingEvening";

  const resolvedTheme = colorMode === "light" ? "light" : "dark";
  const useColorModeValue = (lightValue, darkValue) =>
    resolvedTheme === "light" ? lightValue : darkValue;

  const dynamicStyles = {
    "--login-page-bg": useColorModeValue(
      "radial-gradient(circle at top left, #ffffff 0%, #f3f4f6 35%, #e2e8f0 100%)",
      "radial-gradient(circle at top left, #0f172a 0, #020617 40%, #000 100%)"
    ),
    "--login-shell-bg": useColorModeValue(
      "rgba(255, 255, 255, 0.95)",
      "rgba(15, 23, 42, 0.86)"
    ),
    "--login-shell-border": useColorModeValue(
      "rgba(148, 163, 184, 0.6)",
      "rgba(148, 163, 184, 0.25)"
    ),
    "--login-shell-shadow": useColorModeValue(
      "0 20px 40px rgba(148, 163, 184, 0.4), 0 0 0 1px rgba(226, 232, 240, 0.5)",
      "0 18px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(15, 23, 42, 0.4)"
    ),
    "--login-title-color": useColorModeValue("#0f172a", "#f9fafb"),
    "--login-subtitle-color": useColorModeValue("#475569", "#9ca3af"),
    "--login-logo-color": useColorModeValue("#0f172a", "#e5e7eb"),
    "--login-badge-color": useColorModeValue("#111827", "#e5e7eb"),
    "--login-badge-border": useColorModeValue(
      "1px solid rgba(148, 163, 184, 0.6)",
      "1px solid rgba(148, 163, 184, 0.6)"
    ),
    "--login-highlight-bg": useColorModeValue(
      "linear-gradient(120deg, rgba(248, 250, 252, 0.9), rgba(226, 232, 240, 0.7))",
      "radial-gradient(circle at top left, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9))"
    ),
    "--login-highlight-border": useColorModeValue(
      "1px solid rgba(148, 163, 184, 0.4)",
      "1px solid rgba(148, 163, 184, 0.6)"
    ),
    "--login-highlight-value": useColorModeValue("#111827", "#e5e7eb"),
    "--login-footer-color": useColorModeValue("#475569", "#6b7280"),
    "--login-form-card-bg": useColorModeValue("#ffffff", "rgba(15, 23, 42, 0.95)"),
    "--login-form-card-border": useColorModeValue(
      "rgba(148, 163, 184, 0.5)",
      "rgba(148, 163, 184, 0.6)"
    ),
    "--login-form-card-shadow": useColorModeValue(
      "0 20px 40px rgba(148, 163, 184, 0.4)",
      "0 14px 30px rgba(0, 0, 0, 0.8)"
    ),
    "--login-greeting-color": useColorModeValue("#475569", "#9ca3af"),
    "--login-form-title-color": useColorModeValue("#0f172a", "#f9fafb"),
    "--login-form-subtitle-color": useColorModeValue("#475569", "#6b7280"),
    "--login-label-color": useColorModeValue("#475569", "#e5e7eb"),
    "--login-input-bg": useColorModeValue("#ffffff", "#020617"),
    "--login-input-border": useColorModeValue("#d1d5db", "#4b5563"),
    "--login-input-color": useColorModeValue("#111827", "#f9fafb"),
    "--login-meta-color": useColorModeValue("#475569", "#6b7280"),
    "--login-submit-bg": useColorModeValue(
      "linear-gradient(135deg, #4c1d95, #7c3aed, #ec4899)",
      "linear-gradient(135deg, #4f46e5, #7c3aed, #ec4899)"
    ),
    "--login-submit-shadow": useColorModeValue(
      "0 18px 32px rgba(99, 102, 241, 0.45)",
      "0 12px 26px rgba(79, 70, 229, 0.7)"
    ),
    "--login-submit-color": "#f9fafb",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("[LoginPage] submitting", { email, password });

    try {
      await login(email, password); // backend çağrısını bekle
      navigate("/");
    } catch (err) {
      if (err.message === "UserNotFound") {
        setError("User not found");
      } else if (err.message === "WrongPassword") {
        setError("Incorrect password");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again.");
      }

      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 30;
    setMouseOffset({ x, y });
  };

  const getLatencyDisplay = () => {
    if (latencyStatus === "measuring" || latencyStatus === "idle") {
      return t("login.cardLatencyMeasuring", "Measuring…");
    }
    if (latencyStatus === "offline") {
      return t("login.cardLatencyOffline", "Offline");
    }
    return latencyMs != null ? `${latencyMs}ms` : t("login.cardLatencyMeasuring", "Measuring…");
  };

  const getLatencyMeta = () => {
    if (latencyStatus === "success") {
      return t("login.cardRealtime", "real-time analytics");
    }
    if (latencyStatus === "offline") {
      return t("login.cardLatencyOfflineMeta", "Waiting for backend");
    }
    return t("login.cardLatencyMeasuring", "Measuring…");
  };

  const metricCards = [
    {
      label: t("login.metricsTotalLabel", "Total users"),
      value: dashboardMetrics.totalUsers,
    },
    {
      label: t("login.metricsActiveLabel", "Active users"),
      value: dashboardMetrics.activeUsers,
    },
    {
      label: t("login.metricsInactiveLabel", "Inactive users"),
      value: dashboardMetrics.inactiveUsers,
    },
    {
      label: t("login.metricsAdminLabel", "Admins"),
      value: dashboardMetrics.adminUsers,
    },
  ];

  const getMetricDisplay = (value) => {
    if (metricsStatus === "idle" || metricsStatus === "loading") {
      return t("login.metricsLoading", "Loading…");
    }
    if (metricsStatus === "error") {
      return t("login.metricsUnavailable", "Unavailable");
    }
    return value != null
      ? value
      : t("login.metricsUnavailable", "Unavailable");
  };

  useEffect(() => {
    isMountedRef.current = true;

    const runLatencyCheck = async () => {
      if (!isMountedRef.current) return;
      setLatencyStatus("measuring");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), LATENCY_TIMEOUT);
      const start = performance.now();

      try {
        await fetch(LATENCY_ENDPOINT, {
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });
        const elapsed = Math.max(1, Math.round(performance.now() - start));
        measurementsRef.current = [elapsed, ...measurementsRef.current].slice(
          0,
          LATENCY_WINDOW
        );
        const avg =
          Math.round(
            measurementsRef.current.reduce((acc, value) => acc + value, 0) /
              measurementsRef.current.length
          ) || elapsed;
        if (!isMountedRef.current) return;
        setLatencyMs(avg);
        setLatencyStatus("success");
      } catch (err) {
        if (!isMountedRef.current) return;
        setLatencyStatus("offline");
      } finally {
        clearTimeout(timeoutId);
      }
    };

    runLatencyCheck();
    latencyTimerRef.current = setInterval(runLatencyCheck, LATENCY_INTERVAL);

    return () => {
      isMountedRef.current = false;
      clearInterval(latencyTimerRef.current);
    };
  }, []);
 
  useEffect(() => {
    const controller = new AbortController();

    const fetchMetrics = async () => {
      if (!isMountedRef.current) return;
      setMetricsStatus("loading");
      try {
        const response = await fetch(DASHBOARD_ENDPOINT, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("DashboardFetchFailed");
        }
        const payload = await response.json();
        if (!isMountedRef.current) return;
        setDashboardMetrics({
          totalUsers:
            typeof payload.totalUsers === "number" ? payload.totalUsers : null,
          activeUsers:
            typeof payload.activeUsers === "number" ? payload.activeUsers : null,
          inactiveUsers:
            typeof payload.inactiveUsers === "number" ? payload.inactiveUsers : null,
          adminUsers:
            typeof payload.adminCount === "number" ? payload.adminCount : null,
        });
        setMetricsStatus("success");
      } catch (err) {
        if (!isMountedRef.current) return;
        setMetricsStatus("error");
      }
    };

    fetchMetrics();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="login-page" style={dynamicStyles} onMouseMove={handleMouseMove}>
      <div className="login-shell">
        {/* Sol kısım */}
        <div className="login-side">
          <div className="login-logo">My Admin</div>
          <div className="login-badge">
            <span className="pill-dot" />
            {t("login.badge", "Admin Console v2.0")}
          </div>

          <h1 className="login-title">
            {t(
              "login.title",
              "Control your whole platform in one place."
            )}
          </h1>

          <p className="login-subtitle">
            {t(
              "login.subtitle",
              "Track users, orders and products with a fast, minimal dashboard."
            )}
          </p>

          <div className="login-highlight-cards">
            {metricCards.map((card) => (
              <div className="highlight-card" key={card.label}>
                <div className="highlight-label">{card.label}</div>
                <div className="highlight-value">
                  {getMetricDisplay(card.value)}
                </div>
                <div className="highlight-trend neutral">
                  {t("login.metricsTrend", "—")}
                </div>
              </div>
            ))}
            <div className="highlight-card latency-card">
              <div className="highlight-label">
                {t("login.cardLatency", "Avg. response")}
              </div>
              <div className={`highlight-value latency-value ${latencyStatus}`}>
                {getLatencyDisplay()}
              </div>
              <div className="highlight-trend neutral">
                {getLatencyMeta()}
              </div>
            </div>
          </div>

          <div className="login-footer-text">
            {t(
              "login.footerText",
              "Secure by design. Built for operators like you."
            )}
          </div>
        </div>

        {/* Sağ kısım: form */}
        <div className="login-form-wrapper">
          <div className="login-form-card">
            <p className="login-greeting">
              {t(greetingKey, "Welcome back")}
            </p>
            <h2 className="login-form-title">
              {t("login.formTitle", "Sign in to your admin panel")}
            </h2>
            <p className="login-form-subtitle">
              {t(
                "login.formSubtitle",
                "Use your work email and password to continue."
              )}
            </p>

            <form
              onSubmit={handleSubmit}
              className={`login-form ${shake ? "login-form-shake" : ""}`}
            >
              <div className="form-group">
                <label htmlFor="email">
                  {t("login.email", "Email")}
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t(
                    "login.emailPlaceholder",
                    "you@example.com"
                  )}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label htmlFor="password">
                    {t("login.password", "Password")}
                  </label>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() =>
                      alert("Forgot password flow burada olacak 👀")
                    }
                  >
                    {t("login.forgot", "Forgot password?")}
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={t(
                    "login.passwordPlaceholder",
                    "••••••••"
                  )}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className="login-error">{error}</div>}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading
                  ? t("login.loading", "Signing you in…")
                  : t("login.button", "Sign in")}
              </button>
            </form>

            <p className="login-meta">
              {t(
                "login.metaText",
                "By signing in you agree to our terms and privacy policy."
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Arka plan blur'ları + parallax */}
      <div
        className="login-orb orb-1"
        style={{
          transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
        }}
      />
      <div
        className="login-orb orb-2"
        style={{
          transform: `translate3d(${mouseOffset.x * -0.6}px, ${
            mouseOffset.y * -0.6
          }px, 0)`,
        }}
      />
      <div
        className="login-orb orb-3"
        style={{
          transform: `translate3d(${mouseOffset.x * 0.3}px, ${
            mouseOffset.y * -0.3
          }px, 0)`,
        }}
      />
    </div>
  );
}

export default LoginPage;
