'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopBar } from './DashboardTopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { useSidebarStore } from '@/stores';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

export function DashboardLayout({
  children,
  title,
  description,
  actions,
}: DashboardLayoutProps) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          isCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        )}
      >
        {/* Top Bar */}
        <DashboardTopBar actions={actions} />

        {/* Page Content */}
        <main className="flex-1 px-4 py-6 pb-20 lg:px-8 lg:pb-6">
          <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            {(title || description) && (
              <div className="mb-6">
                {title && (
                  <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="mt-1 text-muted-foreground">{description}</p>
                )}
              </div>
            )}

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}
