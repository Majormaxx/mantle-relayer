'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

export interface StatCardTrend {
  value: number;
  direction: 'up' | 'down' | 'neutral';
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconColor?: 'primary' | 'success' | 'warning' | 'error' | 'secondary';
  trend?: StatCardTrend;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const iconColorClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  secondary: 'bg-secondary/10 text-secondary',
};

export function StatCard({
  title,
  value,
  icon,
  iconColor = 'primary',
  trend,
  loading = false,
  onClick,
  className,
}: StatCardProps) {
  const isInteractive = !!onClick;

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        'relative rounded-lg border border-border bg-card p-6 transition-all duration-200',
        isInteractive && [
          'cursor-pointer',
          'hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        ],
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'mb-4 flex h-10 w-10 items-center justify-center rounded-lg',
          iconColorClasses[iconColor]
        )}
      >
        {icon}
      </div>

      {/* Value */}
      {loading ? (
        <Skeleton className="mb-2 h-8 w-24" />
      ) : (
        <h3 className="mb-1 text-2xl font-bold text-foreground">{value}</h3>
      )}

      {/* Title */}
      <p className="text-sm text-muted-foreground">{title}</p>

      {/* Trend Indicator */}
      {trend && (
        <div className="absolute bottom-6 right-6">
          {loading ? (
            <Skeleton className="h-5 w-16" />
          ) : (
            <TrendIndicator trend={trend} />
          )}
        </div>
      )}
    </div>
  );
}

function TrendIndicator({ trend }: { trend: StatCardTrend }) {
  const { value, direction } = trend;

  const colorClasses = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-muted-foreground',
  };

  const Icon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  }[direction];

  const prefix = direction === 'up' ? '+' : direction === 'down' ? '-' : '';

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-sm font-medium',
        colorClasses[direction]
      )}
    >
      <Icon className="h-4 w-4" />
      <span>
        {prefix}
        {Math.abs(value)}%
      </span>
    </div>
  );
}

// Skeleton version for loading states
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-6',
        className
      )}
    >
      <Skeleton className="mb-4 h-10 w-10 rounded-lg" />
      <Skeleton className="mb-2 h-8 w-24" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}
