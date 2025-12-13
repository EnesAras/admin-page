import "./LoginPage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import translations from "../i18n/translations";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { language = "en", theme = "dark" } = useSettings();
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

  // Saat'e göre selamlama
  const hour = new Date().getHours();
  let greetingKey = "login.greetingDefault";
  if (hour >= 5 && hour < 12) greetingKey = "login.greetingMorning";
  else if (hour >= 12 && hour < 18) greetingKey = "login.greetingAfternoon";
  else greetingKey = "login.greetingEvening";

   const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    await login(email, password); // backend çağrısını bekle
    navigate("/");
  } catch (err) {
    if (err.message === "UserNotFound") {
      setError("User not found");
    } else if (err.message === "WrongPassword") {
      setError("Incorrect password");
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

  return (
    <div
      className={`login-page login-page-${
        theme === "light" ? "light" : "dark"
      }`}
      onMouseMove={handleMouseMove}
    >
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
            <div className="highlight-card">
              <div className="highlight-label">
                {t("login.cardUsers", "Active users")}
              </div>
              <div className="highlight-value">1,248</div>
              <div className="highlight-trend">
                +18% {t("login.cardVsLast", "vs last week")}
              </div>
            </div>
            <div className="highlight-card">
              <div className="highlight-label">
                {t("login.cardLatency", "Avg. response")}
              </div>
              <div className="highlight-value">98ms</div>
              <div className="highlight-trend neutral">
                {t("login.cardRealtime", "real-time analytics")}
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
