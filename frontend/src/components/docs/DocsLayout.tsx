'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DocsHeader } from './DocsHeader';
import { DocsSidebar } from './DocsSidebar';
import { DocsToc } from './DocsToc';

interface DocsLayoutProps {
  children: React.ReactNode;
  showToc?: boolean;
}

export function DocsLayout({ children, showToc = true }: DocsLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950">
      <DocsHeader
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        isMobileMenuOpen={mobileMenuOpen}
      />

      <div className="mx-auto max-w-[90rem]">
        <div className="flex">
          {/* Mobile sidebar overlay */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Sidebar */}
          <DocsSidebar
            className={cn(
              'fixed inset-y-0 left-0 z-40 mt-16 transform border-r border-zinc-800 bg-zinc-950 px-4 py-6 transition-transform lg:static lg:mt-0 lg:translate-x-0 lg:border-0 lg:px-6',
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          />

          {/* Main content */}
          <main className="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-8">
            <article className="prose prose-invert prose-zinc mx-auto max-w-3xl">
              {children}
            </article>
          </main>

          {/* Table of contents */}
          {showToc && (
            <div className="hidden w-64 flex-shrink-0 px-4 py-10 xl:block">
              <DocsToc className="sticky top-24" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
