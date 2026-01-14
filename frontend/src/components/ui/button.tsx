import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles - premium dark theme optimized
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Primary - Indigo with glow effect
        default:
          'bg-primary text-primary-foreground shadow-md hover:bg-primary-light hover:shadow-glow active:scale-[0.98]',
        // Destructive - Red with subtle glow
        destructive:
          'bg-error text-error-foreground shadow-md hover:bg-error/90 hover:shadow-glow-error active:scale-[0.98]',
        // Outline - Border with transparent bg
        outline:
          'border border-border bg-transparent text-foreground hover:bg-accent hover:border-primary/50 active:scale-[0.98]',
        // Secondary - Muted background
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:scale-[0.98]',
        // Ghost - No background until hover
        ghost: 
          'text-foreground hover:bg-accent hover:text-accent-foreground',
        // Link - Underline style
        link: 
          'text-primary underline-offset-4 hover:underline hover:text-primary-light',
        // Success - Green variant
        success:
          'bg-success text-success-foreground shadow-md hover:bg-success/90 hover:shadow-glow-success active:scale-[0.98]',
        // Gradient - Premium gradient button
        gradient:
          'bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-glow hover:opacity-90 active:scale-[0.98]',
        // Glass - Glassmorphism effect
        glass:
          'bg-card/50 backdrop-blur-md border border-border/50 text-foreground hover:bg-card/70 hover:border-primary/30 active:scale-[0.98]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs rounded-md',
        lg: 'h-12 px-6 text-base rounded-lg',
        xl: 'h-14 px-8 text-lg rounded-xl',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
