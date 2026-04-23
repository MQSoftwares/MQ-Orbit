"use client";

import { useTheme } from "@/components/theme-provider";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className }: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const src =
    resolvedTheme === "dark"
      ? "/Logos/mq_orbit_full_logo_transparent_legend_f2f2f2.png"
      : "/Logos/mq_orbit_full_logo_transparent.png";

  return (
    <img
      alt="MQOrbit"
      className={["block", className].filter(Boolean).join(" ")}
      src={src}
    />
  );
}
