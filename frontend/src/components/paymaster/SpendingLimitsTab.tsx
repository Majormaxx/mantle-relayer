'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Info,
  ExternalLink,
  Loader2,
  Check,
  Edit2,
  X,
  Bell,
  Mail,
  DollarSign,
  Clock,
  Calendar,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useSetSpendingLimits } from '@/lib/contracts';

interface SpendingLimit {
  type: 'per-transaction' | 'daily' | 'monthly' | 'global';
  value: number | null;
  used?: number;
  resetTime?: string;
}

interface SpendingLimitsTabProps {
  paymasterId: string;
}

interface LimitCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  currentValue: number | null;
  usedValue?: number;
  resetInfo?: string;
  recommendation?: string;
  onSave: (value: number) => Promise<void>;
  onRemove?: () => Promise<void>;
}

function LimitCard({
  title,
  description,
  icon,
  currentValue,
  usedValue,
  resetInfo,
  recommendation,
  onSave,
  onRemove,
}: LimitCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentValue?.toString() ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const usagePercent = currentValue && usedValue !== undefined
    ? Math.round((usedValue / currentValue) * 100)
    : 0;
  const isWarning = usagePercent >= 80 && usagePercent < 100;
  const isError = usagePercent >= 100;

  const handleSave = async () => {
    const value = parseFloat(inputValue);
    if (isNaN(value) || value <= 0) return;
    
    setIsSaving(true);
    try {
      await onSave(value);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    setIsSaving(true);
    try {
      await onRemove();
      setIsEditing(false);
      setInputValue('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      className={cn(
        'transition-colors',
        isError && 'border-error/50 bg-error/5',
        isWarning && !isError && 'border-warning/50 bg-warning/5'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                isError ? 'bg-error/10 text-error' :
                isWarning ? 'bg-warning/10 text-warning' :
                'bg-primary/10 text-primary'
              )}
            >
              {icon}
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </div>
          </div>
          {currentValue !== null && !isEditing && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInputValue(currentValue.toString());
                  setIsEditing(true);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentValue !== null && usedValue !== undefined && !isEditing && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {usedValue.toFixed(2)} / {currentValue.toFixed(2)} MNT used
                </span>
                <span
                  className={cn(
                    'font-medium',
                    isError ? 'text-error' :
                    isWarning ? 'text-warning' :
                    'text-muted-foreground'
                  )}
                >
                  {usagePercent}%
                </span>
              </div>
              <Progress
                value={Math.min(usagePercent, 100)}
                className={cn(
                  'h-2',
                  isError && '[&>div]:bg-error',
                  isWarning && !isError && '[&>div]:bg-warning'
                )}
              />
            </div>
            {resetInfo && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {resetInfo}
              </p>
            )}
          </>
        )}

        {currentValue !== null && usedValue === undefined && !isEditing && (
          <div className="text-2xl font-bold text-foreground">
            {currentValue.toFixed(2)} MNT
          </div>
        )}

        {currentValue === null && !isEditing && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Not Set</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Set Limit
            </Button>
          </div>
        )}

        {isEditing && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`limit-${title}`}>Limit Amount (MNT)</Label>
              <Input
                id={`limit-${title}`}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            {recommendation && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                {recommendation}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !inputValue}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setInputValue(currentValue?.toString() ?? '');
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Changes require an on-chain transaction.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SpendingLimitsTab({ paymasterId }: SpendingLimitsTabProps) {
  const { toast } = useToast();
  const paymasterAddress = paymasterId as `0x${string}`;
  
  // Contract hook for setting spending limits
  const { setLimits, isPending, isConfirming } = useSetSpendingLimits(paymasterAddress);
  
  // Local state for UI - limits would ideally come from API/indexer
  const [limits, setLocalLimits] = useState<SpendingLimit[]>([
    { type: 'per-transaction', value: null },
    { type: 'daily', value: null, used: 0 },
    { type: 'monthly', value: null, used: 0 },
    { type: 'global', value: null },
  ]);

  const [alerts, setAlerts] = useState({
    dailyThreshold: true,
    dailyReached: true,
    monthlyThreshold: true,
    emailEnabled: false,
    inAppEnabled: true,
  });

  const _isProcessing = isPending || isConfirming;

  const handleSaveLimit = async (type: SpendingLimit['type'], value: number) => {
    // Value is in MNT, pass as string
    const valueStr = value.toString();
    
    // Build limits - use '0' for unchanged limits
    const currentPerTx = limits.find(l => l.type === 'per-transaction')?.value?.toString() || '0';
    const currentDaily = limits.find(l => l.type === 'daily')?.value?.toString() || '0';
    const currentMonthly = limits.find(l => l.type === 'monthly')?.value?.toString() || '0';
    const currentGlobal = limits.find(l => l.type === 'global')?.value?.toString() || '0';
    
    // Call contract with all limits
    setLimits(
      type === 'per-transaction' ? valueStr : currentPerTx,
      type === 'daily' ? valueStr : currentDaily,
      type === 'monthly' ? valueStr : currentMonthly,
      type === 'global' ? valueStr : currentGlobal
    );
    
    // Optimistically update local state
    setLocalLimits((prev) =>
      prev.map((limit) =>
        limit.type === type ? { ...limit, value } : limit
      )
    );
    
    toast({ title: `Updating ${type} limit...` });
  };

  const handleRemoveLimit = async (type: SpendingLimit['type']) => {
    // Set limit to 0 (no limit)
    const currentPerTx = limits.find(l => l.type === 'per-transaction')?.value?.toString() || '0';
    const currentDaily = limits.find(l => l.type === 'daily')?.value?.toString() || '0';
    const currentMonthly = limits.find(l => l.type === 'monthly')?.value?.toString() || '0';
    const currentGlobal = limits.find(l => l.type === 'global')?.value?.toString() || '0';
    
    setLimits(
      type === 'per-transaction' ? '0' : currentPerTx,
      type === 'daily' ? '0' : currentDaily,
      type === 'monthly' ? '0' : currentMonthly,
      type === 'global' ? '0' : currentGlobal
    );
    
    setLocalLimits((prev) =>
      prev.map((limit): SpendingLimit => {
        if (limit.type !== type) return limit;
        const newLimit: SpendingLimit = { type: limit.type, value: null };
        if (limit.resetTime) newLimit.resetTime = limit.resetTime;
        return newLimit;
      })
    );
    
    toast({ title: `Removing ${type} limit...` });
  };

  const perTxLimit = limits.find((l) => l.type === 'per-transaction');
  const dailyLimit = limits.find((l) => l.type === 'daily');
  const monthlyLimit = limits.find((l) => l.type === 'monthly');
  const globalLimit = limits.find((l) => l.type === 'global');

  // Calculate days remaining in month
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = endOfMonth.getDate() - now.getDate();

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground">Cost Controls</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Set spending limits to control costs and prevent unexpected charges.
              Limits help protect against abuse and budget overruns.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
            >
              Learn more about spending limits
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Limit Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <LimitCard
          title="Per-Transaction Limit"
          description="Maximum gas cost per transaction"
          icon={<DollarSign className="h-5 w-5" />}
          currentValue={perTxLimit?.value ?? null}
          recommendation="Recommended: 0.05 MNT for most use cases"
          onSave={(value) => handleSaveLimit('per-transaction', value)}
          onRemove={() => handleRemoveLimit('per-transaction')}
        />

        <LimitCard
          title="Daily Limit"
          description="Maximum spending per day"
          icon={<Clock className="h-5 w-5" />}
          currentValue={dailyLimit?.value ?? null}
          {...(dailyLimit?.used !== undefined && { usedValue: dailyLimit.used })}
          resetInfo="Resets at midnight UTC"
          recommendation="Set based on expected daily transaction volume"
          onSave={(value) => handleSaveLimit('daily', value)}
          onRemove={() => handleRemoveLimit('daily')}
        />

        <LimitCard
          title="Monthly Limit"
          description="Maximum spending per month"
          icon={<Calendar className="h-5 w-5" />}
          currentValue={monthlyLimit?.value ?? null}
          {...(monthlyLimit?.used !== undefined && { usedValue: monthlyLimit.used })}
          resetInfo={`${daysRemaining} days remaining in billing period`}
          recommendation="Set based on your monthly budget"
          onSave={(value) => handleSaveLimit('monthly', value)}
          onRemove={() => handleRemoveLimit('monthly')}
        />

        <LimitCard
          title="Global Limit"
          description="Lifetime spending cap (advanced)"
          icon={<Shield className="h-5 w-5" />}
          currentValue={globalLimit?.value ?? null}
          {...(globalLimit?.used !== undefined && { usedValue: globalLimit.used })}
          recommendation="Optional: Set a total spending cap for this Paymaster"
          onSave={(value) => handleSaveLimit('global', value)}
          onRemove={() => handleRemoveLimit('global')}
        />
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Spending Alerts</CardTitle>
              <CardDescription>
                Get notified when approaching or reaching limits
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notification Channels */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Notification Channels
            </Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">In-App Notifications</span>
                </div>
                <Switch
                  checked={alerts.inAppEnabled}
                  onCheckedChange={(checked) =>
                    setAlerts((prev) => ({ ...prev, inAppEnabled: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Email Notifications</span>
                  <span className="text-xs text-muted-foreground">(Coming Soon)</span>
                </div>
                <Switch
                  checked={alerts.emailEnabled}
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              Alert Triggers
            </Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Daily limit at 80%</p>
                  <p className="text-xs text-muted-foreground">
                    Alert when daily spending reaches 80% of limit
                  </p>
                </div>
                <Switch
                  checked={alerts.dailyThreshold}
                  onCheckedChange={(checked) =>
                    setAlerts((prev) => ({ ...prev, dailyThreshold: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Daily limit reached</p>
                  <p className="text-xs text-muted-foreground">
                    Alert when daily limit is reached
                  </p>
                </div>
                <Switch
                  checked={alerts.dailyReached}
                  onCheckedChange={(checked) =>
                    setAlerts((prev) => ({ ...prev, dailyReached: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Monthly limit at 80%</p>
                  <p className="text-xs text-muted-foreground">
                    Alert when monthly spending reaches 80% of limit
                  </p>
                </div>
                <Switch
                  checked={alerts.monthlyThreshold}
                  onCheckedChange={(checked) =>
                    setAlerts((prev) => ({ ...prev, monthlyThreshold: checked }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning about limits */}
      <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4">
        <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Limits are enforced on-chain
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            When a limit is reached, all new transactions will be rejected until
            the limit resets or is increased. Make sure to set appropriate limits
            based on your expected usage.
          </p>
        </div>
      </div>
    </div>
  );
}
