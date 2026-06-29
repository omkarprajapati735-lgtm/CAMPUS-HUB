import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  isCompact: boolean;
  setIsCompact: (compact: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("campus_theme");
    return (saved as Theme) || "system";
  });

  const [isCompact, setIsCompact] = useState<boolean>(() => {
    return localStorage.getItem("campus_compact") === "true";
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const applyTheme = (currentTheme: Theme) => {
      const root = window.document.documentElement;
      let shouldUseDark = currentTheme === "dark";

      if (currentTheme === "system") {
        shouldUseDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }

      setIsDark(shouldUseDark);

      if (shouldUseDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme(theme);

    // If using system theme, listen for changes
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  // Persist theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("campus_theme", theme);
  }, [theme]);

  // Persist compact mode and apply class
  useEffect(() => {
    localStorage.setItem("campus_compact", isCompact.toString());
    const root = window.document.documentElement;
    if (isCompact) {
      root.classList.add("compact");
    } else {
      root.classList.remove("compact");
    }
  }, [isCompact]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, isCompact, setIsCompact }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
