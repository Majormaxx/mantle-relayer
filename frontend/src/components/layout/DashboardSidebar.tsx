'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Wallet,
  BarChart3,
  Settings,
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSidebarStore } from '@/stores/sidebarStore';

// Navigation configuration
const mainNavItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/paymasters',
    label: 'Paymasters',
    icon: Wallet,
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
] as const;

const secondaryNavItems = [
  {
    href: '/docs',
    label: 'Documentation',
    icon: FileText,
    external: false,
  },
  {
    href: 'https://discord.gg/mantlerelayer',
    label: 'Support',
    icon: HelpCircle,
    external: true,
  },
] as const;

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  isCollapsed: boolean;
  external?: boolean | undefined;
  onClick?: () => void;
}

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  isCollapsed,
  external = false,
  onClick,
}: NavItemProps) {
  const content = (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        'hover:bg-accent',
        isActive
          ? 'bg-primary/10 text-primary border-l-2 border-primary -ml-[2px] pl-[14px]'
          : 'text-muted-foreground hover:text-foreground',
        isCollapsed && 'justify-center px-2'
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
      {!isCollapsed && (
        <span className="truncate">{label}</span>
      )}
      {!isCollapsed && external && (
        <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
      )}
    </div>
  );

  const handleClick = onClick
    ? (_e: React.MouseEvent) => onClick()
    : undefined;

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {external ? (
            <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
              {content}
            </a>
          ) : handleClick ? (
            <Link href={href} onClick={handleClick}>
              {content}
            </Link>
          ) : (
            <Link href={href}>
              {content}
            </Link>
          )}
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {label}
          {external && <ExternalLink className="h-3 w-3" />}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
        {content}
      </a>
    );
  }

  if (handleClick) {
    return (
      <Link href={href} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return (
    <Link href={href}>
      {content}
    </Link>
  );
}

function Logo({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
        <span className="text-white font-bold text-sm">M</span>
      </div>
      {!isCollapsed && (
        <span className="font-semibold text-lg text-foreground">
          Mantle <span className="text-primary">Relayer</span>
        </span>
      )}
    </Link>
  );
}

function WalletSection({ isCollapsed }: { isCollapsed: boolean }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isConnected || !address) {
    return null;
  }

  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleDisconnect = () => {
    disconnect();
  };

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDisconnect}
            className="w-full h-10"
          >
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="text-xs">
            <div className="font-mono">{truncatedAddress}</div>
            <div className="text-muted-foreground mt-1">Click to disconnect</div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="p-3">
      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-medium">
            {address.slice(2, 4).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-sm text-foreground truncate">
            {truncatedAddress}
          </div>
          <div className="text-xs text-muted-foreground">Connected</div>
        </div>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDisconnect}
              className="h-8 w-8 shrink-0"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Disconnect</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebarStore();

  const isNavActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border',
          'hidden lg:flex flex-col',
          'transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center border-b border-border px-2">
          <Logo isCollapsed={isCollapsed} />
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isNavActive(item.href)}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        </nav>

        {/* Secondary Navigation */}
        <div className="border-t border-border py-4 px-2">
          <div className="space-y-1">
            {secondaryNavItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={false}
                isCollapsed={isCollapsed}
                external={item.external}
              />
            ))}
          </div>
        </div>

        {/* User Section */}
        <div className="border-t border-border">
          <WalletSection isCollapsed={isCollapsed} />
        </div>

        {/* Collapse Toggle */}
        <div className="border-t border-border p-2">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggle}
                className={cn(
                  'w-full justify-center',
                  !isCollapsed && 'justify-start'
                )}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    <span>Collapse</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
