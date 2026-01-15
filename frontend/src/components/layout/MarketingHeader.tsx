'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ConnectWalletButton } from '@/components/web3';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// Navigation links configuration
const navLinks: Array<{ href: string; label: string; external?: boolean }> = [
  { href: '/#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
];

interface NavLinkProps {
  href: string;
  label: string;
  external?: boolean | undefined;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

function NavLink({ href, label, external = false, isActive, onClick, className }: NavLinkProps) {
  const baseStyles = cn(
    'text-sm font-medium transition-colors duration-200',
    'hover:text-primary',
    isActive ? 'text-foreground' : 'text-muted-foreground',
    className
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseStyles}
        onClick={onClick}
      >
        {label}
      </a>
    );
  }

  const handleClick = onClick
    ? (_e: React.MouseEvent<HTMLAnchorElement>) => {
        onClick();
      }
    : undefined;

  if (handleClick) {
    return (
      <Link href={href} className={baseStyles} onClick={handleClick}>
        {label}
      </Link>
    );
  }

  return (
    <Link href={href} className={baseStyles}>
      {label}
    </Link>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      {/* Logo icon - can be replaced with actual logo */}
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <span className="text-white font-bold text-sm">M</span>
      </div>
      <span className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-200">
        Mantle{' '}
        <span className="text-primary">Relayer</span>
      </span>
    </Link>
  );
}

export function MarketingHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Handle scroll effect
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Set initial state
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Check if a link is active
  const isLinkActive = (href: string) => {
    if (href.startsWith('/#')) {
      return pathname === '/' && href.includes(pathname);
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'h-14 md:h-16', // 56px mobile, 64px desktop
        'transition-all duration-300 ease-in-out',
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                external={link.external}
                isActive={isLinkActive(link.href)}
              />
            ))}
          </nav>

          {/* Desktop CTA - Right */}
          <div className="hidden md:flex items-center gap-4">
            <ConnectWalletButton label="Connect Wallet" />
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="relative"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full max-w-xs">
              <SheetHeader className="text-left">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <Logo />
              </SheetHeader>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    external={link.external}
                    isActive={isLinkActive(link.href)}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base py-2"
                  />
                ))}
              </nav>

              {/* Mobile CTA */}
              <div className="mt-8 pt-8 border-t border-border">
                <ConnectWalletButton label="Connect Wallet" />
              </div>

              {/* Additional Links */}
              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex flex-col gap-3">
                  <Link
                    href="/about"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <a
                    href="https://github.com/mantle-relayer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://twitter.com/mantlerelayer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Twitter
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
