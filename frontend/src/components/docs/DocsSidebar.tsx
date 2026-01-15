'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Rocket,
  FileCode,
  Settings,
  Box,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  items?: NavItem[];
  external?: boolean;
}

const navigation: NavItem[] = [
  {
    title: 'Getting Started',
    href: '/docs/getting-started',
    icon: Rocket,
    items: [
      { title: 'Overview', href: '/docs/getting-started' },
      { title: 'Quick Start', href: '/docs/getting-started/quickstart' },
      { title: 'Installation', href: '/docs/getting-started/installation' },
    ],
  },
  {
    title: 'Guides',
    href: '/docs/guides',
    icon: BookOpen,
    items: [
      { title: 'Create Paymaster', href: '/docs/guides/create-paymaster' },
      { title: 'Fund Paymaster', href: '/docs/guides/fund-paymaster' },
      { title: 'Whitelist Contracts', href: '/docs/guides/whitelist-contracts' },
      { title: 'SDK Integration', href: '/docs/guides/sdk-integration' },
    ],
  },
  {
    title: 'SDK Reference',
    href: '/docs/sdk',
    icon: Box,
    items: [
      { title: 'Installation', href: '/docs/sdk/installation' },
      { title: 'Client', href: '/docs/sdk/client' },
      { title: 'Examples', href: '/docs/sdk/examples' },
    ],
  },
  {
    title: 'API Reference',
    href: '/docs/api-reference',
    icon: FileCode,
    items: [
      { title: 'Endpoints', href: '/docs/api-reference/endpoints' },
      { title: 'Errors', href: '/docs/api-reference/errors' },
    ],
  },
  {
    title: 'Smart Contracts',
    href: '/docs/contracts',
    icon: Settings,
    items: [
      { title: 'RelayerHub', href: '/docs/contracts/relayer-hub' },
      { title: 'PaymasterFactory', href: '/docs/contracts/paymaster-factory' },
      { title: 'Paymaster', href: '/docs/contracts/paymaster' },
    ],
  },
  {
    title: 'Resources',
    href: '/docs/resources',
    icon: HelpCircle,
    items: [
      { title: 'FAQ', href: '/docs/resources/faq' },
      { title: 'Troubleshooting', href: '/docs/resources/troubleshooting' },
      { title: 'GitHub', href: 'https://github.com/mantle-relayer', external: true },
    ],
  },
];

interface DocsSidebarProps {
  className?: string;
}

export function DocsSidebar({ className }: DocsSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/docs') return pathname === '/docs';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isSectionActive = (item: NavItem) => {
    if (isActive(item.href)) return true;
    return item.items?.some((subItem) => isActive(subItem.href)) ?? false;
  };

  return (
    <aside className={cn('w-64 flex-shrink-0', className)}>
      <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pb-10">
        <nav className="space-y-6">
          {/* Docs Home Link */}
          <div>
            <Link
              href="/docs"
              className={cn(
                'flex items-center gap-2 text-sm font-semibold transition-colors',
                pathname === '/docs'
                  ? 'text-indigo-400'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              <BookOpen className="h-4 w-4" />
              Documentation
            </Link>
          </div>

          {/* Navigation Sections */}
          {navigation.map((section) => (
            <div key={section.href} className="space-y-2">
              <Link
                href={section.href}
                className={cn(
                  'flex items-center gap-2 text-sm font-semibold transition-colors',
                  isSectionActive(section)
                    ? 'text-zinc-200'
                    : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                {section.icon && <section.icon className="h-4 w-4" />}
                {section.title}
              </Link>

              {section.items && (
                <ul className="ml-6 space-y-1 border-l border-zinc-800">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      {item.external ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 py-1 pl-4 text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                        >
                          {item.title}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className={cn(
                            'block py-1 pl-4 text-sm transition-colors',
                            isActive(item.href)
                              ? 'border-l-2 border-indigo-500 -ml-px text-indigo-400 font-medium'
                              : 'text-zinc-500 hover:text-zinc-200'
                          )}
                        >
                          {item.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* External Links */}
          <div className="border-t border-zinc-800 pt-6 space-y-2">
            <a
              href="https://github.com/mantle-relayer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-200"
            >
              GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-200"
            >
              Dashboard
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  );
}
