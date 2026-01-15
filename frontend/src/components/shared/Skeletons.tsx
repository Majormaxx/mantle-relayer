'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  hasIcon?: boolean;
  hasValue?: boolean;
  hasTrend?: boolean;
}

/**
 * Skeleton for stat cards and paymaster cards
 */
export function SkeletonCard({ 
  className, 
  hasIcon = true, 
  hasValue = true, 
  hasTrend = true 
}: SkeletonCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {hasIcon && (
            <Skeleton className="h-10 w-10 rounded-lg" />
          )}
          {hasTrend && (
            <Skeleton className="h-5 w-16" />
          )}
        </div>
        {hasValue && (
          <div className="mt-4 space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SkeletonPaymasterCardProps {
  className?: string;
}

/**
 * Skeleton for paymaster list cards
 */
export function SkeletonPaymasterCard({ className }: SkeletonPaymasterCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        
        {/* Address */}
        <Skeleton className="h-4 w-48" />
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-12" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-8" />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
        </div>
      </CardContent>
    </Card>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
  showHeader?: boolean;
}

/**
 * Skeleton for data tables
 */
export function SkeletonTable({ 
  rows = 5, 
  columns = 5, 
  className,
  showHeader = true 
}: SkeletonTableProps) {
  return (
    <div className={cn('w-full rounded-lg border border-border', className)}>
      {showHeader && (
        <div className="border-b border-border bg-muted/30 p-4">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      )}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                className={cn(
                  'h-4 flex-1',
                  colIndex === 0 && 'max-w-[120px]',
                  colIndex === columns - 1 && 'max-w-[80px]'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface SkeletonTransactionRowProps {
  className?: string;
}

/**
 * Skeleton for a single transaction row
 */
export function SkeletonTransactionRow({ className }: SkeletonTransactionRowProps) {
  return (
    <div className={cn('flex items-center gap-4 p-4', className)}>
      {/* Status */}
      <Skeleton className="h-8 w-8 rounded-lg" />
      
      {/* Hash */}
      <Skeleton className="h-4 w-32" />
      
      {/* User */}
      <Skeleton className="h-4 w-24" />
      
      {/* Contract */}
      <Skeleton className="h-4 w-28" />
      
      {/* Function */}
      <Skeleton className="h-4 w-20" />
      
      {/* Gas */}
      <Skeleton className="h-4 w-16" />
      
      {/* Time */}
      <Skeleton className="h-4 w-14" />
    </div>
  );
}

interface SkeletonChartProps {
  className?: string;
  height?: number;
}

/**
 * Skeleton for chart areas
 */
export function SkeletonChart({ className, height = 300 }: SkeletonChartProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="relative overflow-hidden rounded-lg bg-muted/30"
          style={{ height }}
        >
          {/* Animated gradient shimmer */}
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          
          {/* Mock chart lines */}
          <svg 
            className="absolute inset-0 h-full w-full" 
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,150 Q50,100 100,120 T200,100 T300,130 T400,80 T500,110"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeOpacity="0.2"
              className="text-primary"
            />
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  widths?: string[];
}

/**
 * Skeleton for text content with variable line widths
 */
export function SkeletonText({ 
  lines = 3, 
  className,
  widths = ['100%', '85%', '70%']
}: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="h-4"
          style={{ width: widths[i % widths.length] }}
        />
      ))}
    </div>
  );
}

interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Skeleton for avatar/icon placeholders
 */
export function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };
  
  return <Skeleton className={cn('rounded-full', sizes[size], className)} />;
}

/**
 * Skeleton for the dashboard page
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <Skeleton className="h-8 w-64" />
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      
      {/* Chart and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonChart height={350} />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Skeleton for the paymasters list page
 */
export function SkeletonPaymastersList() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-36" />
      </div>
      
      {/* Toolbar */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonPaymasterCard />
        <SkeletonPaymasterCard />
        <SkeletonPaymasterCard />
        <SkeletonPaymasterCard />
      </div>
    </div>
  );
}

/**
 * Skeleton for paymaster detail page
 */
export function SkeletonPaymasterDetail() {
  return (
    <div className="space-y-6">
      {/* Back link */}
      <Skeleton className="h-4 w-32" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      
      {/* Tabs */}
      <Skeleton className="h-10 w-full max-w-md" />
      
      {/* Content */}
      <SkeletonChart height={300} />
    </div>
  );
}

/**
 * Skeleton for analytics page
 */
export function SkeletonAnalytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      
      {/* Main chart */}
      <SkeletonChart height={350} />
      
      {/* Secondary charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonChart height={250} />
        <SkeletonChart height={250} />
      </div>
    </div>
  );
}
