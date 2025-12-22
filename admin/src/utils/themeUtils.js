export function applyDocumentTheme(effectiveTheme, userTheme = "dark") {
  if (typeof document === "undefined") return;

  const normalized = effectiveTheme === "light" ? "light" : "dark";
  document.body.classList.remove("theme-light", "theme-dark");
  document.body.classList.add(`theme-${normalized}`);
  document.documentElement.classList.remove("app-light", "app-dark");
  document.documentElement.classList.add(`app-${normalized}`);
  document.documentElement.setAttribute("data-theme", normalized);
  document.body.dataset.userTheme = userTheme || "dark";
}
