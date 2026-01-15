'use client';

import { useEffect, useRef, useState } from 'react';
import { TrendingUp } from 'lucide-react';

import { cn } from '@/lib/utils';

interface StatItem {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  trend?: number;
}

const stats: StatItem[] = [
  {
    value: 10000,
    suffix: '+',
    label: 'Transactions Sponsored',
    trend: 23,
  },
  {
    value: 500,
    suffix: '+',
    label: 'Developers Building',
    trend: 12,
  },
  {
    value: 50000,
    prefix: '$',
    suffix: '+',
    label: 'Gas Saved for Users',
    trend: 45,
  },
];

function useCountUp(
  end: number,
  duration: number = 2000,
  shouldStart: boolean = false
): number {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldStart) return;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      countRef.current = Math.floor(easeOut * end);
      setCount(countRef.current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, shouldStart]);

  return count;
}

function StatCard({ stat, index, isVisible }: { stat: StatItem; index: number; isVisible: boolean }) {
  const count = useCountUp(stat.value, 2000, isVisible);

  const formattedValue = count.toLocaleString();

  return (
    <div
      className={cn(
        'flex flex-col items-center text-center p-6 md:p-8 rounded-2xl',
        'bg-card/50 backdrop-blur-sm',
        'transition-all duration-700 ease-out',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Value */}
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
        {stat.prefix}
        {formattedValue}
        {stat.suffix}
      </div>

      {/* Label */}
      <div className="text-sm md:text-base text-muted-foreground mb-3">
        {stat.label}
      </div>

      {/* Trend indicator */}
      {stat.trend && (
        <div className="flex items-center gap-1 text-xs text-success">
          <TrendingUp className="w-3 h-3" />
          <span>+{stat.trend}% this month</span>
        </div>
      )}
    </div>
  );
}

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setIsVisible(true);
            setHasAnimated(true);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-50px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              stat={stat}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
