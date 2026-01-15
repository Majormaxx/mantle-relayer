'use client';

import { cn } from '@/lib/utils';
import { AlertCircle, Info, Lightbulb, AlertTriangle, CheckCircle2, type LucideIcon } from 'lucide-react';

type CalloutType = 'note' | 'tip' | 'warning' | 'danger' | 'info' | 'success';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const calloutConfig: Record<CalloutType, {
  icon: LucideIcon;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  titleColor: string;
  defaultTitle: string;
}> = {
  note: {
    icon: Info,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/50',
    iconColor: 'text-blue-400',
    titleColor: 'text-blue-400',
    defaultTitle: 'Note',
  },
  tip: {
    icon: Lightbulb,
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/50',
    iconColor: 'text-emerald-400',
    titleColor: 'text-emerald-400',
    defaultTitle: 'Tip',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/50',
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-400',
    defaultTitle: 'Warning',
  },
  danger: {
    icon: AlertCircle,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/50',
    iconColor: 'text-red-400',
    titleColor: 'text-red-400',
    defaultTitle: 'Danger',
  },
  info: {
    icon: Info,
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/50',
    iconColor: 'text-indigo-400',
    titleColor: 'text-indigo-400',
    defaultTitle: 'Info',
  },
  success: {
    icon: CheckCircle2,
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/50',
    iconColor: 'text-green-400',
    titleColor: 'text-green-400',
    defaultTitle: 'Success',
  },
};

export function Callout({ type = 'note', title, children, className }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;
  const displayTitle = title ?? config.defaultTitle;

  return (
    <div
      className={cn(
        'my-6 rounded-lg border-l-4 p-4',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', config.iconColor)} />
        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold mb-1', config.titleColor)}>
            {displayTitle}
          </p>
          <div className="text-sm text-zinc-300 prose-p:my-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
