'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-secondary/20 blur-[120px] animate-pulse-slow animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[150px] animate-drift" />
        
        {/* Grid overlay for depth */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <div
          className={cn(
            'inline-flex mb-6 transition-all duration-700 ease-out',
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          )}
        >
          <Badge 
            variant="outline" 
            className="px-4 py-1.5 text-sm font-medium border-primary/30 bg-primary/5 text-primary"
          >
            <Layers className="w-4 h-4 mr-2" />
            Built for Mantle
          </Badge>
        </div>

        {/* Main headline */}
        <h1
          className={cn(
            'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6',
            'transition-all duration-700 ease-out delay-100',
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          )}
        >
          Let Your Users Transact{' '}
          <span className="relative">
            <span className="bg-gradient-to-r from-primary via-primary-light to-secondary bg-clip-text text-transparent">
              Without Gas
            </span>
            {/* Underline decoration */}
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-primary/30"
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
            >
              <path
                d="M0 8 Q 50 0, 100 8 T 200 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className={cn(
            'text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10',
            'transition-all duration-700 ease-out delay-200',
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          )}
        >
          Sponsor gas fees for your users and provide a seamless Web3 experience.
          <br className="hidden sm:block" />
          {' '}Built on Mantle L2 for lightning-fast, cost-effective transactions.
        </p>

        {/* CTA buttons */}
        <div
          className={cn(
            'flex flex-col sm:flex-row items-center justify-center gap-4 mb-8',
            'transition-all duration-700 ease-out delay-300',
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          )}
        >
          <Button asChild size="lg" className="min-w-[180px] h-12 text-base">
            <Link href="/dashboard">Get Started Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-[180px] h-12 text-base">
            <Link href="/docs">
              View Documentation
            </Link>
          </Button>
        </div>

        {/* Trust text */}
        <p
          className={cn(
            'text-sm text-muted-foreground',
            'transition-all duration-700 ease-out delay-400',
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          )}
        >
          Free on testnet • No credit card required
        </p>
      </div>

      {/* Scroll indicator */}
      <div 
        className={cn(
          'absolute bottom-8 left-1/2 -translate-x-1/2',
          'transition-all duration-700 ease-out delay-500',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-muted-foreground/50 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
