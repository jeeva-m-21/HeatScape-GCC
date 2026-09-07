import type { Metadata } from "next";
import "./globals.css";
import { HeatScapeCopilot } from "@/components/copilot/HeatScapeCopilot";

export const metadata: Metadata = {
  title: "HeatScape // Greater Chennai Corporation",
  description:
    "Spatiotemporal Urban Heat Intelligence, Early Warning & Intervention Planner for Chennai, Tamil Nadu, India",
};

import { LanguageProvider } from "@/lib/i18n";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen selection:bg-primary-container selection:text-on-primary-container">
        <LanguageProvider>
          {children}
          <HeatScapeCopilot />
        </LanguageProvider>
      </body>
    </html>
  );
}
