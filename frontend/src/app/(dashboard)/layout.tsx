'use client';

import type { ReactNode } from 'react';

import { DashboardSidebar, MobileBottomNav, DashboardTopBar } from '@/components/layout';
import { useSidebarStore } from '@/stores';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Main content area */}
      <div
        className={cn(
          'flex flex-col min-h-screen',
          'transition-all duration-300 ease-in-out',
          // Adjust padding based on sidebar state (desktop only)
          'lg:pl-60',
          isCollapsed && 'lg:pl-16'
        )}
      >
        {/* Top bar with breadcrumbs, notifications, user */}
        <DashboardTopBar />

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Add bottom padding on mobile for bottom nav */}
        <div className="h-16 lg:hidden" />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
