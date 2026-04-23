import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { SidebarMenu } from "@/components/home/sidebar-menu";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit",
  description: "Projeto base Next.js com App Router e Tailwind CSS.",
  icons: {
    icon: "/Logos/mq_orbit_icon_only_transparent.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var theme = window.localStorage.getItem('mqorbit-theme') || 'light';
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                } catch (error) {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
        <ThemeProvider>
          <div className="min-h-screen bg-background text-foreground">
            <SidebarMenu />
            <div className="lg:pl-80">
              <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-10 lg:py-8">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
