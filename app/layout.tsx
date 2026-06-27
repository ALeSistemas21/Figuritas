import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const primaryFont = Montserrat({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Álbum FWC 26",
  description: "Intercambiá tus figuritas del Mundial 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${primaryFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
