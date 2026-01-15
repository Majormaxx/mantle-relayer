'use client';

import { MarketingHeader } from './MarketingHeader';
import { Footer } from './Footer';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
