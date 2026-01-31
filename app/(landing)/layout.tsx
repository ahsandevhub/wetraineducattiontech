// app/layout.tsx
import { Toaster } from "react-hot-toast";
import DisclaimerBanner from "../components/DisclaimerBanner";
import Footer from "../components/Footer";
import Header from "../components/Header";
import TranslateButton from "../components/TranslateButton";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-sans antialiased bg-white text-gray-900 scroll-smooth">
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
      <TranslateButton />
    </div>
  );
}
