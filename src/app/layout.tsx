import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hornet Imports | Importá sin límites",
  description:
    "Cotizá y comprá productos de todo el mundo con envío a Argentina. Marketplace local con comisión más baja que Mercado Libre.",
  openGraph: {
    title: "Hornet Imports | Importá sin límites",
    description:
      "Marketplace argentino con comisión 8–12% vs el 13–17% de Mercado Libre. Importación directa sin trámites.",
    url: "https://lucasgomezlg.github.io/HornetImports",
    siteName: "Hornet Imports",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hornet Imports | Importá sin límites",
    description:
      "Marketplace argentino con comisión 8–12%. Importá sin trámites.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={geist.variable}>
      <body>{children}</body>
    </html>
  );
}
