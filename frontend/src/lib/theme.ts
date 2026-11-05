export type Theme = "light" | "dark";
export const themeStorageKey = "commerce-theme";

export function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(themeStorageKey);
    if (saved === "light" || saved === "dark") return saved;
  } catch (error) {
    console.error("Unable to read theme preference", error);
  }
  return "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
}

export function saveTheme(theme: Theme) {
  applyTheme(theme);
  try {
    localStorage.setItem(themeStorageKey, theme);
    return true;
  } catch (error) {
    console.error("Unable to save theme preference", error);
    return false;
  }
}
