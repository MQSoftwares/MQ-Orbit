"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = "mqorbit-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const fadeTimeoutRef = useRef<number | null>(null);
  const cleanupTimeoutRef = useRef<number | null>(null);
  const [transitionBackground, setTransitionBackground] = useState<string | null>(
    null,
  );
  const [transitionVisible, setTransitionVisible] = useState(false);
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

      if (storedTheme === "light" || storedTheme === "dark") {
        return storedTheme;
      }
    } catch {
      // Ignore storage access failures and fall back to the document class.
    }

    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  });

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current !== null) {
        window.clearTimeout(fadeTimeoutRef.current);
      }
      if (cleanupTimeoutRef.current !== null) {
        window.clearTimeout(cleanupTimeoutRef.current);
      }
      document.documentElement.classList.remove("theme-transitioning");
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures and keep the current runtime theme.
    }

    applyTheme(theme);
  }, [theme]);

  const transitionToTheme = useCallback((nextTheme: Theme) => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.add("theme-transitioning");

      const currentBackground = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("--app-bg")
        .trim();

      if (currentBackground) {
        setTransitionBackground(currentBackground);
      }

      setTransitionVisible(true);

      if (fadeTimeoutRef.current !== null) {
        window.clearTimeout(fadeTimeoutRef.current);
      }

      if (cleanupTimeoutRef.current !== null) {
        window.clearTimeout(cleanupTimeoutRef.current);
      }

      fadeTimeoutRef.current = window.setTimeout(() => {
        setTransitionVisible(false);
        cleanupTimeoutRef.current = window.setTimeout(() => {
          setTransitionBackground(null);
          document.documentElement.classList.remove("theme-transitioning");
          cleanupTimeoutRef.current = null;
        }, 320);
      }, 40);
    }

    setThemeState(nextTheme);
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    transitionToTheme(nextTheme);
  }, [transitionToTheme]);

  const toggleTheme = useCallback(() => {
    transitionToTheme(theme === "dark" ? "light" : "dark");
  }, [theme, transitionToTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme: theme,
      setTheme,
      toggleTheme,
    }),
    [setTheme, theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
      {transitionBackground ? (
        <div
          aria-hidden="true"
          className={[
            "pointer-events-none fixed inset-0 z-[60] transition-opacity duration-300 ease-out",
            transitionVisible ? "opacity-100" : "opacity-0",
          ].join(" ")}
          style={{ backgroundImage: transitionBackground }}
        />
      ) : null}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
