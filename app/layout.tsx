import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "RitmoLab | Aprendé ritmo jugando",
  description: "Una app gamificada para aprender ritmo, lectura musical y pulso todos los días.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ritmolab.vercel.app")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" style={{ colorScheme: "light" }}>
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#f7fff0" />
      </head>
      <body style={{ backgroundColor: "#f7fff0", colorScheme: "light" }}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
