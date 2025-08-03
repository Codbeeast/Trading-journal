// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import AppWrapper from "@/components/AppWrapper";
import { TradeProvider } from '@/context/TradeContext'; // Correct import path

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const generateViewport = () => ({
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#070a12" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  colorScheme: "dark light",
});

export const metadata = {
  title: {
    default: "ForeNotes | Trade Journal - Track Your Trades",
    template: "%s | ForeNotes",
  },
  description:
    "Professional ForeNotes application to track, analyze, and improve your trading performance with detailed analytics and insights.",
  keywords: [
    "Forenotes",
    "ForeNotes",
    "trade tracking",
    "trading analytics",
    "investment tracking",
    "portfolio management",
    "trading performance",
    "trade analysis",
    "financial tracking",
  ],
  authors: [
    { name: "Abinash Das" },
    { name: "Priyanshu" },
    { name: "Saquib" }
  ],
  creator: "Your Name", // Consider changing this to your actual name or team name
  publisher: "Your Name", // Consider changing this to your actual name or team name
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yourdomain.com", // **IMPORTANT: Change this to your actual domain**
    title: "ForeNotes | Trade Journal - Track Your Trades",
    description:
      "Professional ForeNotes application to track, analyze, and improve your trading performance with detailed analytics and insights.",
    siteName: "Forenotes",
    images: [
      {
        url: "/og-image.jpg", // Ensure this path is correct relative to your public folder
        width: 1200,
        height: 630,
        alt: "ForeNotes Application",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ForeNotes - Track Your Trades",
    description:
      "Professional ForeNotes application to track, analyze, and improve your trading performance with detailed analytics and insights.",
    images: ["/og-image.jpg"], // Ensure this path is correct relative to your public folder
    creator: "@yourusername", // **IMPORTANT: Change this to your actual Twitter handle**
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest", // Ensure this path is correct relative to your public folder
  category: "finance",
  classification: "Trading Application",
  applicationName: "ForeNotes",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://yourdomain.com"), // **IMPORTANT: Change this to your actual domain**
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "your-google-verification-code", // Replace with your actual Google site verification code
    yandex: "your-yandex-verification-code", // Replace with your actual Yandex site verification code
  },
};

export default function RootLayout({ children }) {
  return (

    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ForeNotes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} m-0 p-0`} cz-shortcut-listen="true">
        {/* Wrap your AppWrapper with TradeProvider */}
        <TradeProvider>
          <AppWrapper>{children}</AppWrapper>
        </TradeProvider>
      </body>
    </html>

  );
}