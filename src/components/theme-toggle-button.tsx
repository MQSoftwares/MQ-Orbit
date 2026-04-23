"use client";

import { useTheme } from "@/components/theme-provider";

type ThemeToggleButtonProps = {
  className?: string;
};

export function ThemeToggleButton({ className }: ThemeToggleButtonProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Ativar tema claro" : "Ativar tema escuro";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={toggleTheme}
      className={[
        "group relative inline-flex h-12 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-none bg-transparent p-0 shadow-none transition-transform duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]",
        className ?? "",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-0 rounded-[inherit] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isDark ? "bg-slate-950/10 opacity-0" : "bg-white/25 opacity-100",
        ].join(" ")}
      />
      <img
        alt=""
        aria-hidden="true"
        className={[
          "absolute inset-0 block h-full w-full object-contain transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isDark
            ? "translate-x-2 scale-[0.98] opacity-0"
            : "translate-x-0 scale-100 opacity-100",
        ].join(" ")}
        src="/svgs/sidebar/mq_orbit_toggle_theme_assets/toggle_modo_claro_mq.svg"
      />
      <img
        alt=""
        aria-hidden="true"
        className={[
          "absolute inset-0 block h-full w-full object-contain transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isDark
            ? "translate-x-0 scale-100 opacity-100"
            : "-translate-x-2 scale-[0.98] opacity-0",
        ].join(" ")}
        src="/svgs/sidebar/mq_orbit_toggle_theme_assets/toggle_modo_escuro_mq.svg"
      />
    </button>
  );
}
