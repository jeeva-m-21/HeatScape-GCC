import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "HeatScape // Greater Chennai Corporation",
  description: "Spatiotemporal Urban Heat Intelligence, Early Warning & Intervention Planner for Chennai, Tamil Nadu, India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${ibmPlexMono.variable} font-sans bg-canvas text-slate-100 antialiased min-h-screen selection:bg-accent selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
