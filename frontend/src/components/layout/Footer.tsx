'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ExternalLink, Twitter, Github } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Discord icon (not in Lucide)
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Status', href: 'https://status.mantlerelayer.xyz', external: true },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: 'https://docs.mantlerelayer.xyz', external: true },
      { label: 'SDK Reference', href: 'https://docs.mantlerelayer.xyz/sdk', external: true },
      { label: 'Tutorials', href: 'https://docs.mantlerelayer.xyz/tutorials', external: true },
      { label: 'GitHub', href: 'https://github.com/mantle-relayer', external: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

const socialLinks = [
  {
    label: 'Twitter',
    href: 'https://twitter.com/mantlerelayer',
    icon: Twitter,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/mantle-relayer',
    icon: Github,
  },
  {
    label: 'Discord',
    href: 'https://discord.gg/mantlerelayer',
    icon: DiscordIcon,
  },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  const content = (
    <span className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
      {link.label}
      {link.external && <ExternalLink className="h-3 w-3" />}
    </span>
  );

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <Link href={link.href}>{content}</Link>;
}

function FooterSectionDesktop({ section }: { section: FooterSection }) {
  return (
    <div>
      <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
      <ul className="space-y-3">
        {section.links.map((link) => (
          <li key={link.label}>
            <FooterLinkItem link={link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterSectionMobile({ section }: { section: FooterSection }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-3 border-b border-border">
        <span className="font-semibold text-foreground">{section.title}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="space-y-3 py-3 pl-2">
          {section.links.map((link) => (
            <li key={link.label}>
              <FooterLinkItem link={link} />
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="relative">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
      </div>
      <span className="font-bold text-lg">
        <span className="text-foreground">Mantle</span>
        <span className="text-primary">Relayer</span>
      </span>
    </Link>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Desktop layout: 4 columns */}
        <div className="hidden md:grid md:grid-cols-5 gap-8">
          {/* Column 1: Logo and tagline */}
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 text-muted-foreground max-w-xs">
              Gasless transactions on Mantle. Let your users transact without paying for gas.
            </p>
          </div>

          {/* Columns 2-4: Link sections */}
          {footerSections.map((section) => (
            <FooterSectionDesktop key={section.title} section={section} />
          ))}
        </div>

        {/* Mobile layout: Stacked with accordions */}
        <div className="md:hidden">
          {/* Logo and tagline */}
          <div className="mb-8">
            <Logo />
            <p className="mt-4 text-muted-foreground">
              Gasless transactions on Mantle. Let your users transact without paying for gas.
            </p>
          </div>

          {/* Accordion sections */}
          <div className="space-y-0">
            {footerSections.map((section) => (
              <FooterSectionMobile key={section.title} section={section} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Copyright and legal links */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              <span>© {currentYear} Mantle Relayer. All rights reserved.</span>
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </Link>
              </div>
            </div>

            {/* Right: Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
