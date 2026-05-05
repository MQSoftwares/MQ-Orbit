import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const manifestPath = join(root, "public", "manifest.webmanifest");
const swPath = join(root, "public", "sw.js");

describe("PWA assets", () => {
  it("ships the manifest and service worker", () => {
    expect(existsSync(manifestPath)).toBe(true);
    expect(existsSync(swPath)).toBe(true);
  });

  it("declares installable PWA metadata", () => {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      background_color: string;
      display: string;
      icons: Array<{ purpose: string; sizes: string; src: string }>;
      name: string;
      scope: string;
      short_name: string;
      start_url: string;
      theme_color: string;
    };

    expect(manifest.name).toBe("MQOrbit");
    expect(manifest.short_name).toBe("MQOrbit");
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#0E3A53");
    expect(manifest.background_color).toBe("#020B25");
    expect(manifest.icons).toEqual([
      expect.objectContaining({
        src: "/pwa/icon-192x192.png",
        sizes: "192x192",
        purpose: "any",
      }),
      expect.objectContaining({
        src: "/pwa/icon-512x512.png",
        sizes: "512x512",
        purpose: "any maskable",
      }),
    ]);
  });

  it("registers a cache-first shell and navigation fallback", () => {
    const serviceWorker = readFileSync(swPath, "utf8");

    expect(serviceWorker).toContain('self.addEventListener("install"');
    expect(serviceWorker).toContain('self.addEventListener("activate"');
    expect(serviceWorker).toContain('self.addEventListener("fetch"');
    expect(serviceWorker).toContain("cache.addAll");
    expect(serviceWorker).toContain("clients.claim");
    expect(serviceWorker).toContain('"/manifest.webmanifest"');
  });
});
