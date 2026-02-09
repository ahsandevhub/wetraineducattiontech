// app/layout.tsx
import DisclaimerBanner from "@/app/components/DisclaimerBanner";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import WhatsAppButton from "@/app/components/WhatsAppButton";
import { Toaster } from "react-hot-toast";

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

      {/* Fixed WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
}
