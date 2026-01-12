import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./components/LanguageToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartBytt – Spar penger på strøm, mobil og bredbånd",
  description:
    "Last opp regningene dine og få bedre avtaler. SmartBytt analyserer og viser nøyaktig hva du kan spare.",
  icons: {
    icon: [
      { url: "/brand/favicon.ico", sizes: "any" },
      { url: "/brand/smartbytt-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/smartbytt-icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/brand/smartbytt-icon-180.png", sizes: "180x180", type: "image/png" },
      { url: "/brand/smartbytt-icon-167.png", sizes: "167x167", type: "image/png" },
      { url: "/brand/smartbytt-icon-152.png", sizes: "152x152", type: "image/png" },
    ],
  },
  openGraph: {
    title: "SmartBytt – Spar penger på strøm, mobil og bredbånd",
    description: "Last opp regningene dine og få bedre avtaler. SmartBytt analyserer og viser nøyaktig hva du kan spare.",
    url: "https://smartbytt.no",
    siteName: "SmartBytt",
    locale: "nb_NO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartBytt – Spar penger på strøm, mobil og bredbånd",
    description: "Last opp regningene dine og få bedre avtaler.",
  },
};

// Script to prevent flash of wrong theme
const themeScript = `
  (function() {
    try {
      var saved = localStorage.getItem('darkMode');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'true' || (saved === null && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
