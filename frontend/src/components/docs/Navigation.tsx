'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Define the documentation structure for prev/next navigation
interface NavItem {
  title: string;
  href: string;
}

const flatNavigation: NavItem[] = [
  // Getting Started
  { title: 'Introduction', href: '/docs' },
  { title: 'Getting Started', href: '/docs/getting-started' },
  { title: 'Quick Start', href: '/docs/getting-started/quickstart' },
  { title: 'Installation', href: '/docs/getting-started/installation' },
  
  // Guides
  { title: 'Guides', href: '/docs/guides' },
  { title: 'Create Paymaster', href: '/docs/guides/create-paymaster' },
  { title: 'Fund Paymaster', href: '/docs/guides/fund-paymaster' },
  { title: 'Whitelist Contracts', href: '/docs/guides/whitelist-contracts' },
  { title: 'SDK Integration', href: '/docs/guides/sdk-integration' },
  
  // SDK
  { title: 'SDK Reference', href: '/docs/sdk' },
  { title: 'SDK Installation', href: '/docs/sdk/installation' },
  { title: 'SDK Client', href: '/docs/sdk/client' },
  { title: 'SDK Examples', href: '/docs/sdk/examples' },
  
  // API Reference
  { title: 'API Reference', href: '/docs/api-reference' },
  { title: 'API Endpoints', href: '/docs/api-reference/endpoints' },
  { title: 'Error Codes', href: '/docs/api-reference/errors' },
  
  // Contracts
  { title: 'Smart Contracts', href: '/docs/contracts' },
  { title: 'RelayerHub', href: '/docs/contracts/relayer-hub' },
  { title: 'PaymasterFactory', href: '/docs/contracts/paymaster-factory' },
  { title: 'Paymaster', href: '/docs/contracts/paymaster' },
  
  // Resources
  { title: 'Resources', href: '/docs/resources' },
  { title: 'FAQ', href: '/docs/resources/faq' },
  { title: 'Troubleshooting', href: '/docs/resources/troubleshooting' },
];

interface PrevNextNavigationProps {
  className?: string;
}

export function PrevNextNavigation({ className }: PrevNextNavigationProps) {
  const pathname = usePathname();
  
  // Find current page index
  const currentIndex = flatNavigation.findIndex(item => item.href === pathname);
  
  // Get previous and next pages
  const prevPage = currentIndex > 0 ? flatNavigation[currentIndex - 1] : null;
  const nextPage = currentIndex < flatNavigation.length - 1 ? flatNavigation[currentIndex + 1] : null;

  if (!prevPage && !nextPage) {
    return null;
  }

  return (
    <nav
      className={cn(
        'mt-16 flex flex-col gap-4 border-t border-zinc-800 pt-8 sm:flex-row sm:justify-between',
        className
      )}
      aria-label="Page navigation"
    >
      {/* Previous page */}
      {prevPage ? (
        <Link
          href={prevPage.href}
          className="group flex flex-1 flex-col items-start gap-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900"
        >
          <span className="flex items-center gap-1 text-sm text-zinc-500">
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Previous
          </span>
          <span className="font-medium text-zinc-200 group-hover:text-indigo-400">
            {prevPage.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {/* Next page */}
      {nextPage ? (
        <Link
          href={nextPage.href}
          className="group flex flex-1 flex-col items-end gap-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900"
        >
          <span className="flex items-center gap-1 text-sm text-zinc-500">
            Next
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
          <span className="font-medium text-zinc-200 group-hover:text-indigo-400">
            {nextPage.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}

// Breadcrumb navigation
interface BreadcrumbItem {
  title: string;
  href: string;
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  
  // Build breadcrumb path from current URL
  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const parts = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { title: 'Docs', href: '/docs' }
    ];
    
    let currentPath = '';
    for (const part of parts) {
      currentPath += `/${part}`;
      if (currentPath === '/docs') continue;
      
      // Convert slug to readable title
      const title = part
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({ title, href: currentPath });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      className={cn('mb-4 flex items-center gap-1.5 text-sm', className)}
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="text-zinc-600">/</span>
            )}
            {isLast ? (
              <span className="text-zinc-400">{crumb.title}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-zinc-500 transition-colors hover:text-zinc-300"
              >
                {crumb.title}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
