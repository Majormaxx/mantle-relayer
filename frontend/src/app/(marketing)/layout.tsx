import type { ReactNode } from 'react';

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header will be added here */}
      <main className="flex-1">{children}</main>
      {/* Footer will be added here */}
    </div>
  );
}
