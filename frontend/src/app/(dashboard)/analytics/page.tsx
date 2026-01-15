'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  XCircle,
  Fuel,
  Download,
  Calendar as CalendarIcon,
  RefreshCw,
  Lightbulb,
  ChevronDown,
  FileText,
  FileJson,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

// Types
interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

type ChartView = 'volume' | 'gas' | 'both';

// Mock data generators
function generateVolumeData(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    return {
      date: format(date, 'MMM dd'),
      fullDate: format(date, 'yyyy-MM-dd'),
      transactions: Math.floor(50 + Math.random() * 200),
      gasSpent: (0.5 + Math.random() * 2).toFixed(3),
    };
  });
}

function generatePaymasterGasData() {
  return [
    { name: 'GameToken Paymaster', value: 45.5, color: '#6366F1' },
    { name: 'NFT Minting', value: 28.3, color: '#0EA5E9' },
    { name: 'DeFi Gateway', value: 18.2, color: '#22C55E' },
    { name: 'Social App', value: 8.0, color: '#F59E0B' },
  ];
}

function generateTopContractsData() {
  return [
    { name: 'GameToken', transactions: 1250 },
    { name: 'CoolNFT', transactions: 890 },
    { name: 'SwapRouter', transactions: 654 },
    { name: 'StakingPool', transactions: 432 },
    { name: 'Marketplace', transactions: 298 },
  ];
}

// Components
function StatCard({
  title,
  value,
  trend,
  trendValue,
  icon: Icon,
  iconColor = 'primary',
}: {
  title: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ElementType;
  iconColor?: 'primary' | 'success' | 'warning' | 'error';
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && trendValue && (
              <div className="flex items-center gap-1 text-xs">
                {trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3 text-error" />}
                <span className={cn(
                  trend === 'up' && 'text-success',
                  trend === 'down' && 'text-error',
                  trend === 'neutral' && 'text-muted-foreground'
                )}>
                  {trendValue}
                </span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            )}
          </div>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colorClasses[iconColor])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DateRangePicker({
  dateRange,
  onDateRangeChange,
}: {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({});

  const presets = [
    { label: 'Today', from: startOfDay(new Date()), to: endOfDay(new Date()) },
    { label: 'Yesterday', from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) },
    { label: 'Last 7 days', from: subDays(new Date(), 6), to: new Date() },
    { label: 'Last 30 days', from: subDays(new Date(), 29), to: new Date() },
    { label: 'Last 90 days', from: subDays(new Date(), 89), to: new Date() },
    { label: 'This month', from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
    { label: 'Last month', from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) },
  ];

  const handlePreset = (preset: typeof presets[0]) => {
    onDateRangeChange({ ...preset });
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    if (customRange.from && customRange.to) {
      onDateRangeChange({
        from: customRange.from,
        to: customRange.to,
        label: `${format(customRange.from, 'MMM d, yyyy')} - ${format(customRange.to, 'MMM d, yyyy')}`,
      });
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          {dateRange.label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          <div className="border-r border-border p-2 space-y-1">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant={dateRange.label === preset.label ? 'secondary' : 'ghost'}
                size="sm"
                className="w-full justify-start"
                onClick={() => handlePreset(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="p-3">
            <Calendar
              mode="range"
              selected={{ from: customRange.from, to: customRange.to }}
              onSelect={(range) => setCustomRange({ from: range?.from, to: range?.to })}
              disabled={(date) => date > new Date()}
              numberOfMonths={1}
            />
            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCustomRange({})}
              >
                Clear
              </Button>
              <Button
                size="sm"
                disabled={!customRange.from || !customRange.to}
                onClick={handleCustomApply}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ExportButton({ onExport }: { onExport: (type: 'transactions' | 'summary' | 'json') => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onExport('transactions')}>
          <FileText className="h-4 w-4 mr-2" />
          Export Transactions (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport('summary')}>
          <FileText className="h-4 w-4 mr-2" />
          Export Summary (CSV)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onExport('json')}>
          <FileJson className="h-4 w-4 mr-2" />
          Export Raw Data (JSON)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 6),
    to: new Date(),
    label: 'Last 7 days',
  });
  const [chartView, setChartView] = useState<ChartView>('volume');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const volumeData = useMemo(() => generateVolumeData(days), [days]);
  const paymasterGasData = useMemo(() => generatePaymasterGasData(), []);
  const topContractsData = useMemo(() => generateTopContractsData(), []);

  // Calculate stats
  const totalTransactions = volumeData.reduce((sum, d) => sum + d.transactions, 0);
  const totalGasSpent = volumeData.reduce((sum, d) => sum + parseFloat(d.gasSpent), 0);
  const avgGasPerTx = totalGasSpent / totalTransactions;
  const successRate = 96.5; // Mock
  const failedTransactions = Math.floor(totalTransactions * 0.035);

  const handleExport = (type: 'transactions' | 'summary' | 'json') => {
    const dateStr = `${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}`;
    
    if (type === 'json') {
      const data = { volumeData, paymasterGasData, topContractsData, dateRange };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mantle-relayer-analytics-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (type === 'summary') {
      const headers = ['Date', 'Total Transactions', 'Gas Spent (MNT)'];
      const rows = volumeData.map((d) => [d.fullDate, d.transactions, d.gasSpent]);
      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mantle-relayer-summary-${dateStr}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // transactions export would need actual transaction data
      alert('Transaction export would require full transaction data from API');
    }
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
    // In real app, would refetch data
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated: {format(lastUpdated, 'PPpp')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Transactions"
          value={totalTransactions.toLocaleString()}
          trend="up"
          trendValue="+12.5%"
          icon={Activity}
          iconColor="primary"
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          trend="up"
          trendValue="+0.5%"
          icon={TrendingUp}
          iconColor="success"
        />
        <StatCard
          title="Failed Transactions"
          value={failedTransactions.toString()}
          trend="down"
          trendValue="-2.3%"
          icon={XCircle}
          iconColor="error"
        />
        <StatCard
          title="Avg Gas per Transaction"
          value={`${avgGasPerTx.toFixed(4)} MNT`}
          trend="neutral"
          trendValue="0%"
          icon={Fuel}
          iconColor="warning"
        />
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transaction Volume</CardTitle>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            {(['volume', 'gas', 'both'] as ChartView[]).map((view) => (
              <Button
                key={view}
                variant={chartView === view ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setChartView(view)}
                className="capitalize"
              >
                {view === 'both' ? 'Both' : view === 'gas' ? 'Gas Spent' : 'Volume'}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis
                  dataKey="date"
                  stroke="#71717A"
                  tick={{ fill: '#71717A', fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#71717A"
                  tick={{ fill: '#71717A', fontSize: 12 }}
                />
                {(chartView === 'gas' || chartView === 'both') && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#71717A"
                    tick={{ fill: '#71717A', fontSize: 12 }}
                  />
                )}
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181B',
                    border: '1px solid #27272A',
                    borderRadius: '8px',
                  }}
                />
                {(chartView === 'volume' || chartView === 'both') && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="transactions"
                    stroke="#6366F1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTransactions)"
                    name="Transactions"
                  />
                )}
                {(chartView === 'gas' || chartView === 'both') && (
                  <Area
                    yAxisId={chartView === 'both' ? 'right' : 'left'}
                    type="monotone"
                    dataKey="gasSpent"
                    stroke="#0EA5E9"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorGas)"
                    name="Gas Spent (MNT)"
                  />
                )}
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pie Chart - Gas Usage by Paymaster */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gas Usage by Paymaster</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymasterGasData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {paymasterGasData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181B',
                      border: '1px solid #27272A',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)} MNT`, 'Gas Used']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {paymasterGasData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart - Top Contracts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topContractsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                  <XAxis type="number" stroke="#71717A" tick={{ fill: '#71717A', fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#71717A"
                    tick={{ fill: '#71717A', fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181B',
                      border: '1px solid #27272A',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="transactions" fill="#6366F1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-warning" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-success/5 border border-success/20 p-4">
              <p className="text-sm">
                <span className="font-semibold text-success">Your users saved</span>
              </p>
              <p className="text-2xl font-bold text-success mt-1">
                ${(totalGasSpent * 0.5).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">in gas fees this period</p>
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm">
                <span className="font-semibold text-primary">Transaction volume is</span>
              </p>
              <p className="text-2xl font-bold text-primary mt-1">
                +12.5% ↑
              </p>
              <p className="text-xs text-muted-foreground mt-1">compared to last period</p>
            </div>
            <div className="rounded-lg bg-muted/50 border border-border p-4">
              <p className="text-sm">
                <span className="font-semibold">Most active contract</span>
              </p>
              <p className="text-2xl font-bold mt-1">
                GameToken
              </p>
              <p className="text-xs text-muted-foreground mt-1">1,250 transactions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
