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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#f7fff0" />
      </head>
      <body className="font-sans bg-app text-zinc-950" style={{ colorScheme: "light" }}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
