// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import DisclaimerBanner from "./components/DisclaimerBanner";
import Footer from "./components/Footer";
import Header from "./components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeTrain Marketing — Global Marketing Solutions",
  description:
    "WeTrain Marketing is a global marketing company delivering innovative strategies, brand growth, and creative campaigns for businesses worldwide.",
  keywords: [
    "marketing",
    "global marketing solutions",
    "branding",
    "advertising",
    "digital campaigns",
    "creative agency",
    "growth strategy",
  ],
  openGraph: {
    title: "WeTrain Marketing — Global Marketing Solutions",
    description:
      "Innovative global marketing strategies and creative campaigns to grow your brand worldwide.",
    url: "https://wetraineducation.com",
    siteName: "WeTrain Marketing",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WeTrain Marketing — Global Marketing Solutions",
    description:
      "Global marketing expertise and creative campaigns for brands that want to grow worldwide.",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL("https://wetraineducation.com"),
  category: "Marketing",
};

export const viewport: Viewport = {
  themeColor: "#0B0F19",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-white text-gray-900 scroll-smooth">
        {/* Toast notifications */}
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

        {/* Optional top banner or announcement */}
        <DisclaimerBanner />

        {/* Global marketing header */}
        <Header />

        {/* Main content */}
        <main id="main-content">{children}</main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
