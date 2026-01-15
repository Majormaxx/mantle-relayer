'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export function FinalCTASection() {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-zinc-950 to-sky-950/50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-indigo-500/10 to-sky-500/10 blur-3xl animate-pulse-slow" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top left dots */}
        <div className="absolute top-20 left-[10%] w-2 h-2 rounded-full bg-indigo-400/30 animate-drift" />
        <div className="absolute top-32 left-[15%] w-1.5 h-1.5 rounded-full bg-sky-400/40 animate-drift animation-delay-2000" />
        <div className="absolute top-16 left-[20%] w-1 h-1 rounded-full bg-indigo-300/50 animate-drift animation-delay-4000" />
        
        {/* Top right dots */}
        <div className="absolute top-24 right-[12%] w-2 h-2 rounded-full bg-sky-400/30 animate-drift animation-delay-2000" />
        <div className="absolute top-40 right-[18%] w-1.5 h-1.5 rounded-full bg-indigo-400/40 animate-drift" />
        <div className="absolute top-12 right-[22%] w-1 h-1 rounded-full bg-sky-300/50 animate-drift animation-delay-4000" />
        
        {/* Bottom dots */}
        <div className="absolute bottom-28 left-[25%] w-1.5 h-1.5 rounded-full bg-indigo-400/30 animate-drift animation-delay-4000" />
        <div className="absolute bottom-20 right-[28%] w-2 h-2 rounded-full bg-sky-400/30 animate-drift animation-delay-2000" />
        
        {/* Sparkle icons */}
        <Sparkles className="absolute top-28 left-[8%] w-4 h-4 text-indigo-400/20 animate-pulse-slow" />
        <Sparkles className="absolute bottom-32 right-[10%] w-3 h-3 text-sky-400/20 animate-pulse-slow animation-delay-2000" />
      </div>

      {/* Content */}
      <div className="relative max-w-3xl mx-auto text-center">
        {/* Gradient border card effect */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-2xl blur opacity-20" />
          <div className="relative bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-12 md:p-16 border border-zinc-800/50">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Go{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
                Gasless
              </span>
              ?
            </h2>
            
            <p className="text-xl text-zinc-400 mb-10 max-w-lg mx-auto">
              Start sponsoring transactions for your users today. 
              Free on testnet.
            </p>

            {/* CTA Button with glow */}
            <div className="relative inline-block group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-lg blur opacity-40 group-hover:opacity-60 transition-opacity" />
              <Button
                asChild
                size="lg"
                className="relative text-lg px-8 py-6 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
              >
                <Link href="/dashboard">
                  Get Started Free
                </Link>
              </Button>
            </div>

            {/* Trust text */}
            <p className="mt-6 text-sm text-zinc-500">
              No credit card required • Deploy in minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
