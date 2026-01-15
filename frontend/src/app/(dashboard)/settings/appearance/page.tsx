'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sun,
  Moon,
  Monitor,
  Minimize2,
  Sparkles,
  Calendar,
  Clock,
  DollarSign,
  Check,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AppearanceSettingsPage() {
  const [saved, setSaved] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    theme: 'dark' as 'light' | 'dark' | 'system',
    compactMode: false,
    sidebarCollapsed: false,
    reduceAnimations: false,
    dateFormat: 'us' as 'us' | 'international',
    timeFormat: '12h' as '12h' | '24h',
    showUsdEquivalent: true,
  });

  const handleChange = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  };

  const ThemeOption = ({
    value,
    label,
    icon: Icon,
    preview,
    disabled,
  }: {
    value: 'light' | 'dark' | 'system';
    label: string;
    icon: React.ElementType;
    preview: React.ReactNode;
    disabled?: boolean;
  }) => (
    <button
      onClick={() => !disabled && handleChange('theme', value)}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all',
        settings.theme === value
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-muted-foreground/50',
        disabled && 'opacity-50 cursor-not-allowed hover:border-border'
      )}
    >
      <div className="relative">
        {preview}
        {disabled && (
          <Badge
            variant="outline"
            className="absolute -top-2 -right-2 text-[10px] px-1.5"
          >
            Soon
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {settings.theme === value && !disabled && (
        <Check className="h-4 w-4 text-primary" />
      )}
      {saved === 'theme' && settings.theme === value && (
        <span className="text-xs text-success">Saved</span>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Customize the look and feel of your dashboard.
        </p>
      </div>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Theme</CardTitle>
          <CardDescription>Choose your preferred color scheme.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <ThemeOption
              value="light"
              label="Light"
              icon={Sun}
              disabled
              preview={
                <div className="w-16 h-12 rounded-lg bg-white border border-gray-200 p-2">
                  <div className="w-full h-2 rounded bg-gray-200" />
                  <div className="w-3/4 h-2 rounded bg-gray-300 mt-1" />
                </div>
              }
            />
            <ThemeOption
              value="dark"
              label="Dark"
              icon={Moon}
              preview={
                <div className="w-16 h-12 rounded-lg bg-zinc-900 border border-zinc-700 p-2">
                  <div className="w-full h-2 rounded bg-zinc-700" />
                  <div className="w-3/4 h-2 rounded bg-zinc-600 mt-1" />
                </div>
              }
            />
            <ThemeOption
              value="system"
              label="System"
              icon={Monitor}
              disabled
              preview={
                <div className="w-16 h-12 rounded-lg overflow-hidden flex">
                  <div className="w-1/2 bg-white border-r border-gray-200 p-1">
                    <div className="w-full h-1.5 rounded bg-gray-200" />
                  </div>
                  <div className="w-1/2 bg-zinc-900 p-1">
                    <div className="w-full h-1.5 rounded bg-zinc-700" />
                  </div>
                </div>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Layout Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Layout</CardTitle>
          <CardDescription>Adjust the layout preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Minimize2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <Label htmlFor="compactMode" className="text-sm font-medium">
                  Compact Mode
                  {saved === 'compactMode' && (
                    <span className="ml-2 text-xs text-success">Saved</span>
                  )}
                </Label>
                <p className="text-xs text-muted-foreground">
                  Reduce spacing for a denser UI
                </p>
              </div>
            </div>
            <Switch
              id="compactMode"
              checked={settings.compactMode}
              onCheckedChange={(checked) => handleChange('compactMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                {settings.sidebarCollapsed ? (
                  <PanelLeftClose className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <PanelLeft className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <Label htmlFor="sidebarCollapsed" className="text-sm font-medium">
                  Sidebar Default State
                  {saved === 'sidebarCollapsed' && (
                    <span className="ml-2 text-xs text-success">Saved</span>
                  )}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {settings.sidebarCollapsed ? 'Collapsed by default' : 'Expanded by default'}
                </p>
              </div>
            </div>
            <Switch
              id="sidebarCollapsed"
              checked={settings.sidebarCollapsed}
              onCheckedChange={(checked) => handleChange('sidebarCollapsed', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Animations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Animations</CardTitle>
          <CardDescription>Control motion and transitions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <Label htmlFor="reduceAnimations" className="text-sm font-medium">
                  Reduce Animations
                  {saved === 'reduceAnimations' && (
                    <span className="ml-2 text-xs text-success">Saved</span>
                  )}
                </Label>
                <p className="text-xs text-muted-foreground">
                  Minimize motion for accessibility or performance
                </p>
              </div>
            </div>
            <Switch
              id="reduceAnimations"
              checked={settings.reduceAnimations}
              onCheckedChange={(checked) => handleChange('reduceAnimations', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Display</CardTitle>
          <CardDescription>Format preferences for dates and numbers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Format */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Date Format</Label>
              {saved === 'dateFormat' && (
                <span className="text-xs text-success">Saved</span>
              )}
            </div>
            <RadioGroup
              value={settings.dateFormat}
              onValueChange={(value: 'us' | 'international') => handleChange('dateFormat', value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="us" id="date-us" />
                <Label htmlFor="date-us" className="text-sm cursor-pointer">
                  MM/DD/YYYY <span className="text-muted-foreground">(01/15/2026)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="international" id="date-int" />
                <Label htmlFor="date-int" className="text-sm cursor-pointer">
                  DD/MM/YYYY <span className="text-muted-foreground">(15/01/2026)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Time Format */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Time Format</Label>
              {saved === 'timeFormat' && (
                <span className="text-xs text-success">Saved</span>
              )}
            </div>
            <RadioGroup
              value={settings.timeFormat}
              onValueChange={(value: '12h' | '24h') => handleChange('timeFormat', value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="12h" id="time-12" />
                <Label htmlFor="time-12" className="text-sm cursor-pointer">
                  12-hour <span className="text-muted-foreground">(3:30 PM)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="24h" id="time-24" />
                <Label htmlFor="time-24" className="text-sm cursor-pointer">
                  24-hour <span className="text-muted-foreground">(15:30)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Currency Display */}
          <div className="flex items-center justify-between py-3 border-t border-border">
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="showUsdEquivalent" className="text-sm font-medium">
                  Show USD Equivalent
                  {saved === 'showUsdEquivalent' && (
                    <span className="ml-2 text-xs text-success">Saved</span>
                  )}
                </Label>
                <p className="text-xs text-muted-foreground">
                  Display approximate USD value alongside MNT
                </p>
              </div>
            </div>
            <Switch
              id="showUsdEquivalent"
              checked={settings.showUsdEquivalent}
              onCheckedChange={(checked) => handleChange('showUsdEquivalent', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
