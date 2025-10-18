
'use client';

import { cva } from 'class-variance-authority';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';

const animatedButtonVariants = cva(
  'relative inline-flex overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background w-full',
  {
    variants: {
      variant: {
        primary: 'shadow-lg shadow-primary/20',
        secondary: 'shadow-lg shadow-accent/20',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

type AnimatedButtonProps = Omit<ButtonProps, 'variant'> & {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
};

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, children, variant = 'primary', ...props }, ref) => {
    return (
      <div className={cn(animatedButtonVariants({ variant: (variant as any) || 'primary' }), className)}>
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#52BFF2_0%,#BE52F2_50%,#52BFF2_100%)]" />
        <Button
          ref={ref}
          className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground backdrop-blur-3xl"
          variant="default"
          {...props}
        >
          {children}
        </Button>
      </div>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

export default AnimatedButton;
