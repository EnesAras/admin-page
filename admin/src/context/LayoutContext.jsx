import { createContext, useCallback, useContext, useMemo, useState } from "react";

const LayoutContext = createContext(null);

export function LayoutProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = useCallback(
    () => setSidebarCollapsed((prev) => !prev),
    []
  );

  const value = useMemo(
    () => ({ sidebarCollapsed, setSidebarCollapsed, toggleSidebar }),
    [sidebarCollapsed, toggleSidebar]
  );

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) {
    throw new Error("useLayout must be used inside a LayoutProvider");
  }
  return ctx;
}
