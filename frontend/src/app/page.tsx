import { MarketingLayout } from '@/components/layout';
import {
  HeroSection,
  StatsSection,
  HowItWorksSection,
  FeaturesGrid,
  CodePreviewSection,
  UseCasesSection,
  FinalCTASection,
} from '@/components/landing';

export default function Home() {
  return (
    <MarketingLayout>
      <HeroSection />
      <StatsSection />
      <HowItWorksSection />
      <FeaturesGrid />
      <CodePreviewSection />
      <UseCasesSection />
      <FinalCTASection />
    </MarketingLayout>
  );
}
