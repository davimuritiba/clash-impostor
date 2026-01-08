import type { Metadata } from "next";
import { Righteous, Bungee } from "next/font/google";
import "./globals.css";

const righteous = Righteous({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-righteous",
  display: "swap",
});

const bungee = Bungee({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bungee",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clash Impostor",
  description: "Jogo de impostor com cartas do Clash Royale",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#4c1d95",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Clash Impostor",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${righteous.variable} ${bungee.variable}`}>
      <body className={`antialiased ${righteous.variable} ${bungee.variable}`}>
        {children}
      </body>
    </html>
  );
}
