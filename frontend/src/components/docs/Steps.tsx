'use client';

import { useState, Children, isValidElement, type ReactNode, type ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

interface StepProps {
  title: string;
  children: ReactNode;
  stepNumber?: number;
  isLast?: boolean;
  completed?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function Step({
  title,
  children,
  stepNumber = 1,
  isLast = false,
  completed = false,
  collapsible = false,
  defaultOpen = true,
}: StepProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="relative flex gap-4">
      {/* Number indicator and line */}
      <div className="flex flex-col items-center">
        {/* Circle with number */}
        <div
          className={cn(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
            completed
              ? 'bg-emerald-500 text-white'
              : 'bg-indigo-500/20 text-indigo-400 border-2 border-indigo-500'
          )}
        >
          {completed ? (
            <Check className="h-4 w-4" />
          ) : (
            stepNumber
          )}
        </div>
        
        {/* Connector line */}
        {!isLast && (
          <div
            className={cn(
              'w-0.5 flex-1 mt-2',
              completed ? 'bg-emerald-500/50' : 'bg-zinc-800'
            )}
          />
        )}
      </div>

      {/* Content */}
      <div className={cn('flex-1 pb-8', isLast && 'pb-0')}>
        {/* Title */}
        {collapsible ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex w-full items-center justify-between text-left"
          >
            <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-zinc-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-zinc-400" />
            )}
          </button>
        ) : (
          <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
        )}

        {/* Step content */}
        <div
          className={cn(
            'mt-2 text-zinc-400',
            collapsible && !isOpen && 'hidden'
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

interface StepsProps {
  children: ReactNode;
  className?: string;
  completed?: number[]; // Array of completed step numbers
}

export function Steps({ children, className, completed = [] }: StepsProps) {
  const childArray = Children.toArray(children);
  const totalSteps = childArray.length;

  return (
    <div className={cn('my-8', className)}>
      {childArray.map((child, index) => {
        if (!isValidElement(child)) return null;
        
        const element = child as ReactElement<StepProps>;
        const stepNumber = index + 1;
        const isLast = index === totalSteps - 1;
        const isCompleted = completed.includes(stepNumber);

        // Clone the child with additional props
        return (
          <Step
            key={index}
            {...element.props}
            stepNumber={stepNumber}
            isLast={isLast}
            completed={isCompleted}
          />
        );
      })}
    </div>
  );
}

// Interactive steps with completion tracking
interface InteractiveStepsProps {
  children: ReactNode;
  className?: string;
  onComplete?: (completedSteps: number[]) => void;
}

export function InteractiveSteps({ children, className, onComplete }: InteractiveStepsProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const childArray = Children.toArray(children);
  const totalSteps = childArray.length;

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => {
      const newCompleted = prev.includes(stepNumber)
        ? prev.filter(n => n !== stepNumber)
        : [...prev, stepNumber];
      onComplete?.(newCompleted);
      return newCompleted;
    });
  };

  return (
    <div className={cn('my-8', className)}>
      {childArray.map((child, index) => {
        if (!isValidElement(child)) return null;
        
        const element = child as ReactElement<StepProps>;
        const stepNumber = index + 1;
        const isLast = index === totalSteps - 1;
        const isCompleted = completedSteps.includes(stepNumber);

        return (
          <InteractiveStep
            key={index}
            {...element.props}
            stepNumber={stepNumber}
            isLast={isLast}
            completed={isCompleted}
            onToggle={() => toggleStep(stepNumber)}
          />
        );
      })}
      
      {/* Progress indicator */}
      <div className="mt-6 flex items-center gap-3 text-sm">
        <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${(completedSteps.length / totalSteps) * 100}%` }}
          />
        </div>
        <span className="text-zinc-400">
          {completedSteps.length}/{totalSteps} complete
        </span>
      </div>
    </div>
  );
}

interface InteractiveStepProps extends StepProps {
  onToggle?: () => void;
}

function InteractiveStep({
  title,
  children,
  stepNumber = 1,
  isLast = false,
  completed = false,
  onToggle,
}: InteractiveStepProps) {
  return (
    <div className="relative flex gap-4">
      {/* Number indicator and line */}
      <div className="flex flex-col items-center">
        {/* Clickable circle */}
        <button
          onClick={onToggle}
          className={cn(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all',
            'hover:scale-110',
            completed
              ? 'bg-emerald-500 text-white'
              : 'bg-zinc-800 text-zinc-400 border-2 border-zinc-700 hover:border-indigo-500'
          )}
        >
          {completed ? (
            <Check className="h-4 w-4" />
          ) : (
            stepNumber
          )}
        </button>
        
        {/* Connector line */}
        {!isLast && (
          <div
            className={cn(
              'w-0.5 flex-1 mt-2',
              completed ? 'bg-emerald-500/50' : 'bg-zinc-800'
            )}
          />
        )}
      </div>

      {/* Content */}
      <div className={cn('flex-1 pb-8', isLast && 'pb-0')}>
        <h3 className={cn(
          'text-lg font-semibold transition-colors',
          completed ? 'text-zinc-500 line-through' : 'text-zinc-100'
        )}>
          {title}
        </h3>
        <div className={cn(
          'mt-2 transition-opacity',
          completed ? 'text-zinc-600 opacity-60' : 'text-zinc-400'
        )}>
          {children}
        </div>
      </div>
    </div>
  );
}
