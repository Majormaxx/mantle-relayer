'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';

export type TimeRange = '7d' | '30d' | '90d';

export interface ChartDataPoint {
  date: string;
  count: number;
  gasUsed: number;
}

export interface TransactionVolumeChartProps {
  data: ChartDataPoint[];
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  loading?: boolean;
  className?: string;
}

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
];

export function TransactionVolumeChart({
  data,
  timeRange = '30d',
  onTimeRangeChange,
  loading = false,
  className,
}: TransactionVolumeChartProps) {
  const [activeRange, setActiveRange] = useState<TimeRange>(timeRange);

  const handleRangeChange = (range: TimeRange) => {
    setActiveRange(range);
    onTimeRangeChange?.(range);
  };

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const days = activeRange === '7d' ? 7 : activeRange === '30d' ? 30 : 90;
    const cutoffDate = subDays(new Date(), days);
    
    return data.filter((point) => {
      const pointDate = parseISO(point.date);
      return pointDate >= cutoffDate;
    });
  }, [data, activeRange]);

  // Format x-axis dates based on range
  const formatXAxis = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (activeRange === '7d') {
      return format(date, 'EEE'); // Mon, Tue, etc.
    } else if (activeRange === '30d') {
      return format(date, 'MMM d'); // Jan 1
    }
    return format(date, 'MMM'); // Jan
  };

  const isEmpty = !loading && filteredData.length === 0;

  if (loading) {
    return <ChartSkeleton className={className ?? ''} />;
  }

  if (isEmpty) {
    return <EmptyChartState className={className ?? ''} />;
  }

  return (
    <div className={cn('rounded-lg border border-border bg-card p-6', className)}>
      {/* Header with time range selector */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Transaction Volume</h3>
          <p className="text-sm text-muted-foreground">
            Transactions over the last {activeRange === '7d' ? '7 days' : activeRange === '30d' ? '30 days' : '90 days'}
          </p>
        </div>
        <TimeRangeSelector
          value={activeRange}
          onChange={handleRangeChange}
        />
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272A"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="#A1A1AA"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#A1A1AA"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dx={-10}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#6366F1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Time range selector component
function TimeRangeSelector({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      {timeRangeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
            value === option.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload as ChartDataPoint;
  const formattedDate = format(parseISO(label), 'MMMM d, yyyy');

  return (
    <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
      <p className="mb-2 text-sm font-medium text-foreground">{formattedDate}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Transactions</span>
          <span className="text-sm font-medium text-foreground">
            {data.count.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Gas Used</span>
          <span className="text-sm font-medium text-foreground">
            {data.gasUsed.toFixed(4)} MNT
          </span>
        </div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyChartState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12',
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Activity className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">No transactions yet</h3>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Transaction data will appear here once users start using your Paymaster.
      </p>
    </div>
  );
}

// Skeleton loading state
function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-6', className)}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </div>
  );
}

// Export skeleton for use elsewhere
export { ChartSkeleton as TransactionVolumeChartSkeleton };
