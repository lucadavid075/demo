import type { Metadata } from "next";
import { Fraunces, Libre_Franklin } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const libreFranklin = Libre_Franklin({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-franklin",
});

export const metadata: Metadata = {
  title: "SCOAN — The Synagogue, Church Of All Nations",
  description:
    "The Synagogue, Church Of All Nations, Ikotun-Egbe, Lagos. Home of Emmanuel TV.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${libreFranklin.variable}`}>
      <body className="bg-parchment text-ink font-body">
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}
