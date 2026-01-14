'use client';

import type { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar will be added here */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 bg-card border-r border-border">
          <div className="flex items-center h-16 px-4 border-b border-border">
            <span className="text-lg font-semibold text-foreground">
              Mantle Relayer
            </span>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {/* Navigation items will be added here */}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Top bar will be added here */}
        <header className="sticky top-0 z-10 flex items-center h-16 px-4 bg-background border-b border-border">
          <div className="flex-1" />
          {/* User menu will be added here */}
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
