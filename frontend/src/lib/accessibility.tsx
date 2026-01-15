'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Screen reader only text - visually hidden but accessible
 */
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

/**
 * Skip to content link for keyboard navigation
 */
export function SkipToContent({ contentId = 'main-content' }: { contentId?: string }) {
  return (
    <a
      href={`#${contentId}`}
      className={cn(
        'fixed top-0 left-0 z-[100] p-4 bg-primary text-primary-foreground',
        'transform -translate-y-full focus:translate-y-0 transition-transform',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
      )}
    >
      Skip to content
    </a>
  );
}

/**
 * Focus trap for modals and dialogs
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable?.focus();
          e.preventDefault();
        }
      }
    }

    element.addEventListener('keydown', handleKeyDown);
    firstFocusable?.focus();

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref]);
}

/**
 * Hook to restore focus when component unmounts
 */
export function useRestoreFocus() {
  const previousElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    previousElement.current = document.activeElement as HTMLElement;

    return () => {
      previousElement.current?.focus();
    };
  }, []);
}

/**
 * Hook to handle escape key press
 */
export function useEscapeKey(callback: () => void, enabled = true) {
  React.useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        callback();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [callback, enabled]);
}

/**
 * Announce content to screen readers
 */
export function useAnnounce() {
  const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return announce;
}

/**
 * Live region for dynamic content updates
 */
export function LiveRegion({ 
  children, 
  priority = 'polite',
  className,
}: { 
  children: React.ReactNode;
  priority?: 'polite' | 'assertive';
  className?: string;
}) {
  return (
    <div 
      role="status" 
      aria-live={priority} 
      aria-atomic="true"
      className={className}
    >
      {children}
    </div>
  );
}

/**
 * Loading state announcement
 */
export function LoadingAnnouncement({ isLoading, label = 'Loading...' }: { isLoading: boolean; label?: string }) {
  return (
    <LiveRegion priority="polite" className="sr-only">
      {isLoading ? label : ''}
    </LiveRegion>
  );
}

/**
 * Visually hidden but focusable button for keyboard users
 */
interface VisuallyHiddenInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function VisuallyHiddenInput({ label, ...props }: VisuallyHiddenInputProps) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <input
        {...props}
        className={cn(
          'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
          props.className
        )}
      />
    </label>
  );
}

/**
 * Focus visible utility - apply focus styles only on keyboard navigation
 */
export const focusVisibleStyles = cn(
  'focus:outline-none',
  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'
);

/**
 * Keyboard navigation indicator
 */
export function useKeyboardNavigation() {
  const [isKeyboardUser, setIsKeyboardUser] = React.useState(false);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    }

    function handleMouseDown() {
      setIsKeyboardUser(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isKeyboardUser;
}

/**
 * Hook to ensure minimum touch target size
 */
export function useTouchTarget(ref: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const { width, height } = element.getBoundingClientRect();
    
    if (width < 44 || height < 44) {
      console.warn(
        `[Accessibility] Touch target is smaller than 44x44px: ${width}x${height}`,
        element
      );
    }
  }, [ref]);
}

/**
 * Accessible icon button wrapper
 */
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: React.ReactNode;
}

export function IconButton({ label, icon, className, ...props }: IconButtonProps) {
  return (
    <button
      {...props}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center min-w-[44px] min-h-[44px]',
        'rounded-md transition-colors',
        'hover:bg-muted focus:outline-none',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        className
      )}
    >
      {icon}
    </button>
  );
}

/**
 * Progress bar with accessibility
 */
interface AccessibleProgressProps {
  value: number;
  max?: number;
  label: string;
  className?: string;
}

export function AccessibleProgress({ value, max = 100, label, className }: AccessibleProgressProps) {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className={className}>
      <div className="flex justify-between text-sm mb-1">
        <span className="sr-only">{label}</span>
        <span aria-hidden="true">{label}</span>
        <span aria-hidden="true">{percentage}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${percentage}%`}
        className="h-2 bg-muted rounded-full overflow-hidden"
      >
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
