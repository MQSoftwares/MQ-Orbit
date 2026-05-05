"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";

type ThemeToggleButtonProps = {
  className?: string;
};

type Theme = "light" | "dark";

function getThemeSnapshot(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }

  const dataTheme = document.documentElement.dataset.theme;

  if (dataTheme === "light" || dataTheme === "dark") {
    return dataTheme;
  }

  try {
    const storedTheme = window.localStorage.getItem("mqorbit-theme");

    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }
  } catch {
    // Ignore storage failures and fall back to the document class.
  }

  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

export function ThemeToggleButton({ className }: ThemeToggleButtonProps) {
  const { toggleTheme } = useTheme();
  const [displayTheme, setDisplayTheme] = useState<Theme>(getThemeSnapshot);
  const isDark = displayTheme === "dark";
  const label = isDark ? "Ativar tema claro" : "Ativar tema escuro";

  useLayoutEffect(() => {
    setDisplayTheme(getThemeSnapshot());
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDisplayTheme(getThemeSnapshot());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isDark}
      onClick={toggleTheme}
      className={[
        "group relative inline-flex h-12 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-none border-0 bg-transparent p-0 shadow-none outline-none ring-0 transition-transform duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
        className ?? "",
      ].join(" ")}
      suppressHydrationWarning
    >
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-0 rounded-[inherit] transition-colors duration-300 ease-out",
          isDark ? "opacity-100" : "opacity-100",
        ].join(" ")}
        suppressHydrationWarning
      />
      {isDark ? (
        <img
          key="dark"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 block h-full w-full object-contain transition-all duration-300 ease-out"
          src="/svgs/sidebar/theme/toggle/dark-mode-toggle.svg"
          suppressHydrationWarning
        />
      ) : (
        <img
          key="light"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 block h-full w-full object-contain transition-all duration-300 ease-out"
          src="/svgs/sidebar/theme/toggle/light-mode-toggle.svg"
          suppressHydrationWarning
        />
      )}
    </button>
  );
}
