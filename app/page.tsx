// app/page.tsx
import CTASection from "./components/CTASection";
import DisclaimerBanner from "./components/DisclaimerBanner";
import HeroSection from "./components/HeroSection";
import WhyChooseUs from "./components/WhyChooseUs";

export default function HomePage() {
  return (
    <div className="bg-white text-gray-900 scroll-smooth">
      <HeroSection />
      <WhyChooseUs />
      <Testim />
      <CTASection />
      <DisclaimerBanner />
    </div>
  );
}
