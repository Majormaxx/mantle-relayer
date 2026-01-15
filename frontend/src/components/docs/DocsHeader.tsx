'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocsHeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function DocsHeader({ onMenuToggle, isMobileMenuOpen }: DocsHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Logo and Nav */}
        <div className="flex items-center gap-6">
          {/* Mobile menu button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Logo */}
          <Link href="/docs" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <span className="hidden font-semibold text-zinc-200 sm:block">
              Mantle Relayer
            </span>
            <span className="hidden rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 sm:block">
              Docs
            </span>
          </Link>

          {/* Version Badge */}
          <span className="hidden rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400 md:block">
            v1.0.0
          </span>
        </div>

        {/* Center: Search */}
        <div className="flex flex-1 items-center justify-center">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex w-full max-w-md items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-500 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search documentation...</span>
            <span className="sm:hidden">Search...</span>
            <kbd className="ml-auto hidden rounded bg-zinc-800 px-1.5 py-0.5 text-xs font-medium text-zinc-400 sm:inline">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/mantle-relayer"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-200 md:flex"
          >
            GitHub
            <ExternalLink className="h-3 w-3" />
          </a>
          <Button asChild size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>

      {/* Search Modal (placeholder - can be expanded) */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="mx-auto mt-20 max-w-2xl rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <Search className="h-5 w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search documentation..."
                className="flex-1 bg-transparent text-lg text-zinc-200 outline-none placeholder:text-zinc-500"
                autoFocus
              />
              <kbd className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                ESC
              </kbd>
            </div>
            <div className="py-8 text-center text-sm text-zinc-500">
              Start typing to search...
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
