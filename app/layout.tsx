// app/layout.tsx
import type { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import "./globals.css";

import { AuthRedirectHandler } from "../components/AuthRedirectHandler";
import { EnvironmentSticker } from "../components/EnvironmentSticker";

export const metadata: Metadata = {
  title: "WeTrainEducation & Tech — Global IT and Marketing Solutions",
  description:
    "WeTrainEducation & Tech is a global IT and marketing company delivering innovative strategies, brand growth, and creative campaigns for businesses worldwide.",
  keywords: [
    "IT services",
    "website development",
    "marketing",
    "global marketing solutions",
    "branding",
    "advertising",
    "digital campaigns",
    "creative agency",
    "growth strategy",
  ],
  openGraph: {
    title: "WeTrainEducation & Tech — Global IT and Marketing Solutions",
    description:
      "Innovative global IT and marketing strategies and creative campaigns to grow your brand worldwide.",
    url: "https://wetraineducation.com",
    siteName: "WeTrainEducation & Tech",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WeTrainEducation & Tech — Global IT and Marketing Solutions",
    description:
      "Global IT and marketing expertise and creative campaigns for brands that want to grow worldwide.",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL("https://wetraineducation.com"),
  category: "Marketing and IT Services",
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
        <AuthRedirectHandler />
        <EnvironmentSticker />
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        <NextTopLoader color="#facc15" height={3} showSpinner={false} />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
