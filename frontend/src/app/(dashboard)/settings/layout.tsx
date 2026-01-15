'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Bell, Palette, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsLayoutProps {
  children: ReactNode;
}

const settingsNav = [
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/appearance', label: 'Appearance', icon: Palette },
  { href: '/settings/danger', label: 'Danger Zone', icon: AlertTriangle },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Settings navigation - sidebar on desktop, tabs on mobile */}
        <nav className="lg:w-56 flex-shrink-0">
          {/* Desktop sidebar */}
          <ul className="hidden lg:block space-y-1">
            {settingsNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                      item.href === '/settings/danger' && 'text-error hover:text-error'
                    )}
                  >
                    <Icon className={cn(
                      'h-4 w-4',
                      item.href === '/settings/danger' && 'text-error'
                    )} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile tabs */}
          <div className="lg:hidden flex overflow-x-auto gap-1 p-1 bg-muted rounded-lg">
            {settingsNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm rounded-md whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-background text-foreground shadow-sm font-medium'
                      : 'text-muted-foreground hover:text-foreground',
                    item.href === '/settings/danger' && 'text-error'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Settings content */}
        <div className="flex-1 max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
