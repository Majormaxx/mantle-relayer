'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Shield,
  BarChart3,
  Zap,
  Code2,
  Bell,
  SlidersHorizontal,
} from 'lucide-react';

import { cn } from '@/lib/utils';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  visual?: React.ReactNode;
  large?: boolean;
}

// Mini progress bars for "Complete Cost Control" visual
function CostControlVisual() {
  return (
    <div className="mt-4 space-y-3">
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Per-transaction</span>
          <span className="text-foreground">0.05 MNT</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full w-1/4 bg-primary rounded-full" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Daily limit</span>
          <span className="text-foreground">45 / 100 MNT</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full w-[45%] bg-secondary rounded-full" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Monthly limit</span>
          <span className="text-foreground">800 / 2000 MNT</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full w-[40%] bg-success rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Mini chart for "Real-time Analytics" visual
function AnalyticsVisual() {
  const bars = [40, 65, 45, 80, 55, 70, 90];

  return (
    <div className="mt-4 flex items-end justify-center gap-1.5 h-16">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-4 bg-primary/80 rounded-t transition-all duration-300 hover:bg-primary"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

const features: Feature[] = [
  {
    icon: SlidersHorizontal,
    title: 'Complete Cost Control',
    description: 'Set per-transaction, daily, and monthly spending limits to stay in budget',
    visual: <CostControlVisual />,
    large: true,
  },
  {
    icon: Shield,
    title: 'Secure by Design',
    description: 'EIP-712 signatures, whitelist contracts, pause anytime',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track every transaction, monitor costs, see unique users',
    visual: <AnalyticsVisual />,
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Sub-second relay times optimized for Mantle L2',
  },
  {
    icon: Code2,
    title: 'TypeScript SDK',
    description: 'Fully typed, well-documented, works with any framework',
  },
  {
    icon: Bell,
    title: 'Low Balance Alerts',
    description: 'Get notified before your Paymaster runs out of funds',
  },
];

function FeatureCard({
  feature,
  index,
  isVisible,
}: {
  feature: Feature;
  index: number;
  isVisible: boolean;
}) {
  const Icon = feature.icon;

  return (
    <div
      className={cn(
        'group relative p-6 md:p-8 rounded-2xl',
        'bg-card border border-border',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1 hover:border-primary/50',
        'hover:shadow-xl hover:shadow-primary/5',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        feature.large && 'md:col-span-2'
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
          <Icon className="w-6 h-6" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground">
          {feature.description}
        </p>

        {/* Visual (if any) */}
        {feature.visual}
      </div>
    </div>
  );
}

export function FeaturesGrid() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          className={cn(
            'text-center mb-16',
            'transition-all duration-700 ease-out',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built for Developers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to offer gasless transactions
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
