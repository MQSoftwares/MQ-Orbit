import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { SidebarMenu } from "@/components/home/sidebar-menu";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit",
  description: "Projeto base Next.js com App Router e Tailwind CSS.",
  applicationName: "MQOrbit",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MQOrbit",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/Logos/mq_orbit_icon_only_transparent.svg",
        type: "image/svg+xml",
      },
      {
        url: "/pwa/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/pwa/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0E3A53",
};

const shouldRegisterServiceWorker = process.env.NODE_ENV === "production";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-dvh">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var theme = window.localStorage.getItem('mqorbit-theme') || 'light';
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                  document.documentElement.dataset.theme = theme;
                } catch (error) {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.dataset.theme = 'light';
                }
              })();
            `,
          }}
        />
        <Script
          id="pwa-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                if (!${JSON.stringify(shouldRegisterServiceWorker)} || !("serviceWorker" in navigator)) {
                  return;
                }

                var registerServiceWorker = function () {
                  navigator.serviceWorker.register("/sw.js").catch(function () {
                    return;
                  });
                };

                if (document.readyState === "complete") {
                  registerServiceWorker();
                  return;
                }

                window.addEventListener("load", registerServiceWorker, { once: true });
              })();
            `,
          }}
        />
        <ThemeProvider>
          <div className="min-h-dvh bg-background text-foreground pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
            <SidebarMenu />
            <div className="sidebar-content">
              <main className="mx-auto flex min-h-dvh w-full flex-col gap-6 px-4 py-4 sm:px-6 lg:px-10 lg:py-8">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
