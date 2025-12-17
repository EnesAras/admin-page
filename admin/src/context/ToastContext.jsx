import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [lastNotification, setLastNotification] = useState(null);
  const [notificationHistory, setNotificationHistory] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ message, type = "info", duration = 4200 }) => {
      if (!message) return null;
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  useEffect(() => {
    const handler = (event) => {
      const detail = event?.detail || {};
      addToast(detail);
      const enriched = {
        ...detail,
        timestamp: Date.now(),
      };
      setLastNotification(enriched);
      setNotificationHistory((prev) => [enriched, ...prev].slice(0, 4));
    };

    window.addEventListener("api-toast", handler);
    return () => window.removeEventListener("api-toast", handler);
  }, [addToast]);

  const value = useMemo(
    () => ({ addToast, lastNotification, notificationHistory }),
    [addToast, lastNotification, notificationHistory]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastPortal toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

function ToastPortal({ toasts, removeToast }) {
  return (
    <div className="toast-portal" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type || "info"}`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
