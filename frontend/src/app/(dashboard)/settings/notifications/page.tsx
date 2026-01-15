'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Mail,
  Smartphone,
  Wallet,
  AlertTriangle,
  Activity,
  Shield,
  Check,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationSetting {
  id: string;
  enabled: boolean;
}

export default function NotificationsSettingsPage() {
  const [saved, setSaved] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    // Channels
    inApp: true,
    email: false,
    push: false,
    // Balance Alerts
    lowBalance: true,
    lowBalanceThreshold: '10',
    criticalBalance: true,
    // Transaction Alerts
    failedTransactions: true,
    spikeInFailed: true,
    realTimeDigest: 'realtime' as 'realtime' | 'daily',
    // Spending Alerts
    dailyLimitApproaching: true,
    dailyLimitReached: true,
    monthlyLimitApproaching: true,
    // System
    newFeatures: true,
    maintenance: true,
    security: true, // Always on
  });

  const handleToggle = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  };

  const handleThresholdChange = (value: string) => {
    setSettings((prev) => ({ ...prev, lowBalanceThreshold: value }));
    setSaved('lowBalanceThreshold');
    setTimeout(() => setSaved(null), 2000);
  };

  const ToggleRow = ({
    id,
    label,
    description,
    checked,
    disabled,
    onChange,
  }: {
    id: string;
    label: string;
    description?: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <div className="flex items-start justify-between py-3">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {label}
          {saved === id && (
            <span className="ml-2 text-xs text-success inline-flex items-center gap-1">
              <Check className="h-3 w-3" /> Saved
            </span>
          )}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        <p className="text-sm text-muted-foreground">
          Configure how you receive alerts and updates.
        </p>
      </div>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Channels</CardTitle>
          <CardDescription>Choose how you want to receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <ToggleRow
            id="inApp"
            label="In-App Notifications"
            description="Show notifications in the dashboard"
            checked={settings.inApp}
            onChange={(checked) => handleToggle('inApp', checked)}
          />
          <div className="flex items-start justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                  <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Requires linked email address
                </p>
              </div>
            </div>
            <Switch
              checked={settings.email}
              disabled
            />
          </div>
          <div className="flex items-start justify-between py-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Browser Push Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                {settings.push ? 'Enabled' : 'Click to request permission'}
              </p>
            </div>
            <Switch
              checked={settings.push}
              onCheckedChange={(checked) => {
                if (checked && 'Notification' in window) {
                  Notification.requestPermission().then((permission) => {
                    if (permission === 'granted') {
                      handleToggle('push', true);
                    }
                  });
                } else {
                  handleToggle('push', false);
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Balance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5 text-primary" />
            Balance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between py-3 border-b border-border">
            <div className="space-y-2">
              <Label htmlFor="lowBalance" className="text-sm font-medium">
                Low Balance Warning
                {saved === 'lowBalance' && (
                  <span className="ml-2 text-xs text-success inline-flex items-center gap-1">
                    <Check className="h-3 w-3" /> Saved
                  </span>
                )}
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified when Paymaster balance falls below threshold
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="threshold" className="text-xs text-muted-foreground">
                  Threshold:
                </Label>
                <Input
                  id="threshold"
                  type="number"
                  value={settings.lowBalanceThreshold}
                  onChange={(e) => handleThresholdChange(e.target.value)}
                  className="w-20 h-8"
                  disabled={!settings.lowBalance}
                />
                <span className="text-xs text-muted-foreground">MNT</span>
                {saved === 'lowBalanceThreshold' && (
                  <span className="text-xs text-success inline-flex items-center gap-1">
                    <Check className="h-3 w-3" /> Saved
                  </span>
                )}
              </div>
            </div>
            <Switch
              id="lowBalance"
              checked={settings.lowBalance}
              onCheckedChange={(checked) => handleToggle('lowBalance', checked)}
            />
          </div>
          <ToggleRow
            id="criticalBalance"
            label="Critical Balance Alert"
            description="Always notify when balance falls below 1 MNT (cannot be disabled)"
            checked={settings.criticalBalance}
            disabled
            onChange={() => {}}
          />
        </CardContent>
      </Card>

      {/* Transaction Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-primary" />
            Transaction Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <ToggleRow
            id="failedTransactions"
            label="Failed Transaction Notifications"
            description="Get notified when a sponsored transaction fails"
            checked={settings.failedTransactions}
            onChange={(checked) => handleToggle('failedTransactions', checked)}
          />
          <ToggleRow
            id="spikeInFailed"
            label="Spike in Failed Transactions"
            description="Alert when failure rate increases significantly"
            checked={settings.spikeInFailed}
            onChange={(checked) => handleToggle('spikeInFailed', checked)}
          />
          <div className="py-3">
            <Label className="text-sm font-medium">Delivery Preference</Label>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setSettings((prev) => ({ ...prev, realTimeDigest: 'realtime' }))}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                  settings.realTimeDigest === 'realtime'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                Real-time
              </button>
              <button
                onClick={() => setSettings((prev) => ({ ...prev, realTimeDigest: 'daily' }))}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                  settings.realTimeDigest === 'daily'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                Daily Digest
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spending Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-primary" />
            Spending Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <ToggleRow
            id="dailyLimitApproaching"
            label="Daily Limit Approaching (80%)"
            description="Alert when daily spending reaches 80% of limit"
            checked={settings.dailyLimitApproaching}
            onChange={(checked) => handleToggle('dailyLimitApproaching', checked)}
          />
          <ToggleRow
            id="dailyLimitReached"
            label="Daily Limit Reached"
            description="Alert when daily limit is reached"
            checked={settings.dailyLimitReached}
            onChange={(checked) => handleToggle('dailyLimitReached', checked)}
          />
          <ToggleRow
            id="monthlyLimitApproaching"
            label="Monthly Limit Approaching (80%)"
            description="Alert when monthly spending reaches 80% of limit"
            checked={settings.monthlyLimitApproaching}
            onChange={(checked) => handleToggle('monthlyLimitApproaching', checked)}
          />
        </CardContent>
      </Card>

      {/* System Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5 text-primary" />
            System Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <ToggleRow
            id="newFeatures"
            label="New Feature Announcements"
            description="Stay updated on new features and improvements"
            checked={settings.newFeatures}
            onChange={(checked) => handleToggle('newFeatures', checked)}
          />
          <ToggleRow
            id="maintenance"
            label="Maintenance Notifications"
            description="Get notified about scheduled maintenance"
            checked={settings.maintenance}
            onChange={(checked) => handleToggle('maintenance', checked)}
          />
          <div className="flex items-start justify-between py-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                Security Alerts
                <Badge variant="secondary" className="text-xs">Always On</Badge>
              </Label>
              <p className="text-xs text-muted-foreground">
                Critical security notifications cannot be disabled
              </p>
            </div>
            <Switch
              checked={true}
              disabled
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
