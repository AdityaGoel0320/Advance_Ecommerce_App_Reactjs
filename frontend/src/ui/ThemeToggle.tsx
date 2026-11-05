import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import toast from "react-hot-toast";
import { applyTheme, readTheme, saveTheme, Theme, themeStorageKey } from "../lib/theme";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    const sync = () => {
      const next = readTheme();
      applyTheme(next);
      setTheme(next);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === themeStorageKey || event.key === null) sync();
    };
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", sync);
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    if (!saveTheme(next)) toast.error("Theme changed, but could not be saved for your next visit.");
    setTheme(next);
  };

  return (
    <button type="button" className="icon-button" onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
      {theme === "dark" ? <FiSun size={19} /> : <FiMoon size={19} />}
    </button>
  );
};

export default ThemeToggle;
