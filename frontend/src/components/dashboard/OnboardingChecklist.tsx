'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Circle,
  Wallet,
  Plus,
  DollarSign,
  Shield,
  Code,
  ChevronDown,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

const STORAGE_KEY = 'onboarding-checklist-state';
const SDK_COMPLETE_KEY = 'onboarding-sdk-complete';

export interface OnboardingState {
  hasPaymaster: boolean;
  hasFundedPaymaster: boolean;
  hasWhitelistedContract: boolean;
}

export interface OnboardingChecklistProps {
  state: OnboardingState;
  className?: string;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: typeof Wallet;
  isComplete: boolean;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  isManual?: boolean;
}

type ViewState = 'expanded' | 'minimized' | 'dismissed';

export function OnboardingChecklist({
  state,
  className,
}: OnboardingChecklistProps) {
  const [viewState, setViewState] = useState<ViewState>('expanded');
  const [sdkComplete, setSdkComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      setViewState(savedState as ViewState);
    }
    
    const savedSdkComplete = localStorage.getItem(SDK_COMPLETE_KEY);
    if (savedSdkComplete === 'true') {
      setSdkComplete(true);
    }
    
    setIsHydrated(true);
  }, []);

  // Save view state to localStorage
  const updateViewState = useCallback((newState: ViewState) => {
    setViewState(newState);
    localStorage.setItem(STORAGE_KEY, newState);
  }, []);

  // Toggle SDK complete status
  const toggleSdkComplete = useCallback(() => {
    const newValue = !sdkComplete;
    setSdkComplete(newValue);
    localStorage.setItem(SDK_COMPLETE_KEY, String(newValue));
  }, [sdkComplete]);

  // Build checklist items
  const items: ChecklistItem[] = [
    {
      id: 'wallet',
      title: 'Connect Wallet',
      description: 'Connect your wallet to get started',
      icon: Wallet,
      isComplete: true, // Always complete if they see this
    },
    {
      id: 'paymaster',
      title: 'Create Paymaster',
      description: 'Deploy your first gas-sponsoring contract',
      icon: Plus,
      isComplete: state.hasPaymaster,
      action: {
        label: 'Create',
        href: '/paymasters/new',
      },
    },
    {
      id: 'fund',
      title: 'Fund Paymaster',
      description: 'Add MNT to enable gas sponsorship',
      icon: DollarSign,
      isComplete: state.hasFundedPaymaster,
      action: {
        label: 'Fund',
        href: '/paymasters',
      },
    },
    {
      id: 'whitelist',
      title: 'Configure Whitelist',
      description: 'Whitelist contracts users can interact with',
      icon: Shield,
      isComplete: state.hasWhitelistedContract,
      action: {
        label: 'Configure',
        href: '/paymasters',
      },
    },
    {
      id: 'sdk',
      title: 'Integrate SDK',
      description: 'Add the SDK to your dApp',
      icon: Code,
      isComplete: sdkComplete,
      isManual: true,
      action: {
        label: 'View Docs',
        href: '/docs/sdk',
      },
    },
  ];

  const completedCount = items.filter((item) => item.isComplete).length;
  const totalCount = items.length;
  const progressPercent = (completedCount / totalCount) * 100;
  const allComplete = completedCount === totalCount;

  // Handle celebration when all complete
  useEffect(() => {
    if (allComplete && isHydrated && viewState === 'expanded') {
      setShowCelebration(true);
      
      // Auto-dismiss after celebration
      const timer = setTimeout(() => {
        updateViewState('dismissed');
      }, 5000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [allComplete, isHydrated, viewState, updateViewState]);

  // Don't render until hydrated to avoid hydration mismatch
  if (!isHydrated) {
    return null;
  }

  // Don't render if dismissed
  if (viewState === 'dismissed') {
    return null;
  }

  // Minimized view - just a small icon button
  if (viewState === 'minimized') {
    return (
      <button
        onClick={() => updateViewState('expanded')}
        className={cn(
          'fixed bottom-20 right-4 z-50 lg:bottom-4',
          'flex h-12 w-12 items-center justify-center rounded-full',
          'bg-gradient-to-r from-primary to-secondary',
          'text-white shadow-lg transition-transform hover:scale-105',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          className
        )}
        aria-label="Show onboarding checklist"
      >
        <span className="text-sm font-bold">{completedCount}/{totalCount}</span>
      </button>
    );
  }

  // Celebration view
  if (showCelebration && allComplete) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-lg p-[1px]',
          'bg-gradient-to-r from-primary via-secondary to-success',
          className
        )}
      >
        <div className="rounded-lg bg-card p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <Sparkles className="h-16 w-16 text-primary animate-pulse" />
              <div className="absolute inset-0 animate-ping">
                <Sparkles className="h-16 w-16 text-primary opacity-50" />
              </div>
            </div>
          </div>
          <h3 className="mb-2 text-xl font-bold text-foreground">
            You&apos;re all set! 🎉
          </h3>
          <p className="text-muted-foreground">
            Your Paymaster is ready to sponsor transactions.
          </p>
        </div>
      </div>
    );
  }

  // Full expanded view
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg p-[1px]',
        'bg-gradient-to-r from-primary via-secondary to-primary',
        className
      )}
    >
      <div className="rounded-lg bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Getting Started</h3>
              <p className="text-xs text-muted-foreground">
                {completedCount} of {totalCount} complete
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateViewState('minimized')}
              aria-label="Minimize checklist"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateViewState('dismissed')}
              aria-label="Dismiss checklist"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 py-3">
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Checklist items */}
        <div className="divide-y divide-border">
          {items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              {...(item.id === 'sdk' ? { onManualToggle: toggleSdkComplete } : {})}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => updateViewState('dismissed')}
          >
            Dismiss forever
          </Button>
        </div>
      </div>
    </div>
  );
}

// Individual checklist item row
function ChecklistItemRow({
  item,
  onManualToggle,
}: {
  item: ChecklistItem;
  onManualToggle?: () => void;
}) {
  const Icon = item.icon;

  const handleCheckboxClick = () => {
    if (item.isManual && onManualToggle) {
      onManualToggle();
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3 transition-colors',
        item.isComplete && 'bg-success/5'
      )}
    >
      {/* Checkbox */}
      <button
        onClick={handleCheckboxClick}
        disabled={!item.isManual}
        className={cn(
          'flex-shrink-0',
          item.isManual && 'cursor-pointer hover:opacity-80',
          !item.isManual && 'cursor-default'
        )}
        aria-label={item.isManual ? `Mark ${item.title} as ${item.isComplete ? 'incomplete' : 'complete'}` : undefined}
      >
        {item.isComplete ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {/* Icon */}
      <div
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
          item.isComplete ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'font-medium',
            item.isComplete ? 'text-muted-foreground line-through' : 'text-foreground'
          )}
        >
          {item.title}
        </p>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </div>

      {/* Action button */}
      {item.action && !item.isComplete && (
        <div className="flex-shrink-0">
          {item.action.href?.startsWith('http') ? (
            <a
              href={item.action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1"
            >
              <Button variant="outline" size="sm" className="gap-1">
                {item.action.label}
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          ) : item.action.href ? (
            <Link href={item.action.href}>
              <Button variant="outline" size="sm">
                {item.action.label}
              </Button>
            </Link>
          ) : item.action.onClick ? (
            <Button variant="outline" size="sm" onClick={item.action.onClick}>
              {item.action.label}
            </Button>
          ) : null}
        </div>
      )}

      {/* Completed indicator */}
      {item.isComplete && (
        <span className="flex-shrink-0 text-xs font-medium text-success">Done</span>
      )}
    </div>
  );
}

// Export skeleton for loading state
export function OnboardingChecklistSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4',
        className
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        <div>
          <div className="mb-1 h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="mb-4 h-2 animate-pulse rounded-full bg-muted" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
            <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
            <div className="flex-1">
              <div className="mb-1 h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-40 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
