'use client';

import { useEffect, useRef, useState } from 'react';
import { Wallet, DollarSign, Code } from 'lucide-react';

import { cn } from '@/lib/utils';

interface Step {
  icon: React.ElementType;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: Wallet,
    title: 'Create Paymaster',
    description: 'Deploy your gas-sponsoring contract with one click',
  },
  {
    icon: DollarSign,
    title: 'Fund & Configure',
    description: 'Add MNT and whitelist the contracts users can interact with',
  },
  {
    icon: Code,
    title: 'Integrate SDK',
    description: 'Copy-paste our SDK into your dApp and go live',
  },
];

function StepCard({
  step,
  index,
  isVisible,
  isActive,
}: {
  step: Step;
  index: number;
  isVisible: boolean;
  isActive: boolean;
}) {
  const Icon = step.icon;

  return (
    <div
      className={cn(
        'relative flex flex-col items-center text-center p-6 md:p-8 rounded-2xl',
        'bg-card border border-border',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        isActive && 'border-primary/50 shadow-lg shadow-primary/10'
      )}
      style={{ transitionDelay: `${index * 200}ms` }}
    >
      {/* Step number badge */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
          {index + 1}
        </div>
      </div>

      {/* Icon */}
      <div
        className={cn(
          'w-16 h-16 rounded-2xl flex items-center justify-center mb-4',
          'bg-primary/10 text-primary',
          'transition-colors duration-300',
          isActive && 'bg-primary text-primary-foreground'
        )}
      >
        <Icon className="w-8 h-8" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground">{step.description}</p>
    </div>
  );
}

function ConnectingLine({ isVisible, index }: { isVisible: boolean; index: number }) {
  return (
    <div
      className={cn(
        'hidden md:flex items-center justify-center flex-1 px-2',
        'transition-opacity duration-500',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      style={{ transitionDelay: `${(index + 1) * 200 + 100}ms` }}
    >
      <svg
        className="w-full h-4 text-border"
        viewBox="0 0 100 16"
        preserveAspectRatio="none"
      >
        <path
          d="M0 8 H100"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 4"
          fill="none"
          className="animate-dash"
        />
        {/* Arrow head */}
        <path
          d="M92 4 L100 8 L92 12"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function MobileConnector({ isVisible, index }: { isVisible: boolean; index: number }) {
  return (
    <div
      className={cn(
        'md:hidden flex justify-center py-4',
        'transition-opacity duration-500',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
      style={{ transitionDelay: `${(index + 1) * 200}ms` }}
    >
      <div className="w-0.5 h-8 bg-border relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div className="w-2 h-2 rotate-45 border-b border-r border-border bg-background" />
        </div>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
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
        threshold: 0.2,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-cycle through steps when visible
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 bg-card/30"
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
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started in under 5 minutes
          </p>
        </div>

        {/* Steps - Desktop */}
        <div className="hidden md:flex items-stretch">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-center flex-1">
              <div className="flex-1">
                <StepCard
                  step={step}
                  index={index}
                  isVisible={isVisible}
                  isActive={activeStep === index}
                />
              </div>
              {index < steps.length - 1 && (
                <ConnectingLine isVisible={isVisible} index={index} />
              )}
            </div>
          ))}
        </div>

        {/* Steps - Mobile */}
        <div className="md:hidden">
          {steps.map((step, index) => (
            <div key={step.title}>
              <StepCard
                step={step}
                index={index}
                isVisible={isVisible}
                isActive={activeStep === index}
              />
              {index < steps.length - 1 && (
                <MobileConnector isVisible={isVisible} index={index} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
