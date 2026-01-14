import {
  HeroSection,
  StatsSection,
  HowItWorksSection,
  FeaturesGrid,
  CodePreviewSection,
  UseCasesSection,
  FinalCTASection,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <FeaturesGrid />
      <CodePreviewSection />
      <UseCasesSection />
      <FinalCTASection />
    </>
  );
}
