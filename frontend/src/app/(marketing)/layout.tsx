import type { ReactNode } from 'react';

import { MarketingHeader, Footer } from '@/components/layout';

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />
      {/* Add padding for fixed header: 56px mobile, 64px desktop */}
      <main className="flex-1 pt-14 md:pt-16">{children}</main>
      <Footer />
    </div>
  );
}
