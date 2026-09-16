import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SCOAN — The Synagogue, Church Of All Nations",
  description:
    "The Synagogue, Church Of All Nations, Ikotun-Egbe, Lagos. Home of Emmanuel TV.",
};

/**
 * Fonts are loaded in the browser rather than at build time.
 *
 * This project previously used `next/font/google`, which fetches the font CSS during
 * compilation. That fails in any environment without outbound network access (including
 * this sandbox and most CI runners), and Next falls back to a system serif with a build
 * warning. A plain stylesheet link keeps the same families and the same CSS variables —
 * so `font-display` and `font-body` in tailwind.config.ts are unchanged — while degrading
 * gracefully when the network is unavailable.
 *
 * To switch back: re-add the `next/font/google` imports and set the same two variables.
 */
const FONT_CSS = `
  :root {
    --font-fraunces: "Fraunces", ui-serif, Georgia, Cambria, "Times New Roman", serif;
    --font-franklin: "Libre Franklin", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Libre+Franklin:wght@300;400;500;600;700&display=swap"
        />
        <style dangerouslySetInnerHTML={{ __html: FONT_CSS }} />
      </head>
      <body className="bg-parchment text-ink font-body">
        <div className="grain" />
        {children}
      </body>
    </html>
  );
}
