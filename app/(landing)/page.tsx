// app/page.tsx
import CertificatesSection from "../components/CertificatesSection";
import ChallengeFlow from "../components/ChallengeFlow";
import CoursesSection from "../components/CoursesSection";
import CTASection from "../components/CTASection";
import HeroSection from "../components/HeroSection";
import ITServicesSection from "../components/ITServicesSection";
import MarketingServicesSection from "../components/MarketingServicesSection";
import ProjectsSection from "../components/ProjectsSection";
import Proposal from "../components/Proposal";
import Testimonials from "../components/Testimonials";
import WhyChooseUs from "../components/WhyChooseUs";

export default function HomePage() {
  return (
    <div className="bg-white text-gray-900 scroll-smooth">
      <HeroSection />
      <WhyChooseUs />
      <CoursesSection />
      <ITServicesSection />
      <MarketingServicesSection />
      <ProjectsSection />
      <CertificatesSection />
      <ChallengeFlow />
      <Testimonials />
      <CTASection />
      <Proposal />
    </div>
  );
}
