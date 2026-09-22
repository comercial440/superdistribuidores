import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Superdistribuidores",
  description: "Portafolio técnico y comparativo de fichas. Información de uso exclusivo del destinatario.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
