'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import {
  Bell,
  ChevronRight,
  Home,
  Wallet,
  BarChart3,
  Settings,
  Menu,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores';

// Breadcrumb configuration
const breadcrumbConfig: Record<string, { label: string; icon: React.ElementType }> = {
  dashboard: { label: 'Dashboard', icon: Home },
  paymasters: { label: 'Paymasters', icon: Wallet },
  analytics: { label: 'Analytics', icon: BarChart3 },
  settings: { label: 'Settings', icon: Settings },
};

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ElementType | undefined;
  isLast: boolean;
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = '';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const config = breadcrumbConfig[segment];
    const isLast = index === segments.length - 1;

    const item: BreadcrumbItem = {
      label: config?.label || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: currentPath,
      isLast,
    };
    
    if (config?.icon) {
      item.icon = config.icon;
    }
    
    breadcrumbs.push(item);
  });

  return breadcrumbs;
}

function Breadcrumbs() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  if (breadcrumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {breadcrumbs.map((crumb, index) => {
        const Icon = crumb.icon;

        return (
          <div key={crumb.href} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            {crumb.isLast ? (
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                {Icon && <Icon className="h-4 w-4" />}
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {Icon && <Icon className="h-4 w-4" />}
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function NotificationBell() {
  // Mock notification count - would come from real state
  const notificationCount = 3;
  const hasNotifications = notificationCount > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label={`Notifications${hasNotifications ? ` (${notificationCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="font-semibold">Notifications</span>
          <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs">
            Mark all read
          </Button>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {/* Mock notifications */}
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
              <span className="font-medium text-sm">Low balance warning</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Paymaster "Main" balance is below 10 MNT
            </p>
            <span className="text-xs text-muted-foreground">2 min ago</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
              <span className="font-medium text-sm">Transaction sponsored</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully sponsored transfer for 0x1a2b...
            </p>
            <span className="text-xs text-muted-foreground">5 min ago</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer opacity-60">
            <span className="font-medium text-sm">Daily limit reached</span>
            <p className="text-xs text-muted-foreground">
              Paymaster "NFT Mints" reached daily spending limit
            </p>
            <span className="text-xs text-muted-foreground">1 hour ago</span>
          </DropdownMenuItem>
        </div>
        <div className="border-t border-border p-2">
          <Button variant="ghost" className="w-full justify-center text-sm">
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function WalletAvatar({ address }: { address: string }) {
  // Generate a simple color based on address
  const colorIndex = parseInt(address.slice(2, 4), 16) % 5;
  const colors = [
    'bg-primary',
    'bg-secondary',
    'bg-success',
    'bg-warning',
    'bg-destructive',
  ];

  return (
    <Avatar className="h-8 w-8">
      <AvatarFallback className={cn(colors[colorIndex], 'text-white text-xs font-medium')}>
        {address.slice(2, 4).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

function UserSection() {
  const { address, isConnected, isConnecting } = useAccount();

  if (isConnecting) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <Button variant="outline" size="sm">
        Connect Wallet
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-accent transition-colors cursor-pointer">
            <WalletAvatar address={address} />
            <span className="text-sm font-medium font-mono hidden sm:inline">
              {truncateAddress(address)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-mono text-xs">{address}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface DashboardTopBarProps {
  actions?: React.ReactNode;
  isLoading?: boolean;
}

export function DashboardTopBar({ actions, isLoading }: DashboardTopBarProps) {
  const { toggle } = useSidebarStore();

  if (isLoading) {
    return (
      <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-full px-4 md:px-6">
          <Skeleton className="h-5 w-40" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left side: Mobile menu + Breadcrumbs */}
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={toggle}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Breadcrumbs />
        </div>

        {/* Right side: Actions + Notifications + User */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Page-specific actions slot */}
          {actions && (
            <div className="hidden sm:flex items-center gap-2">
              {actions}
            </div>
          )}

          <NotificationBell />
          <UserSection />
        </div>
      </div>
    </header>
  );
}
