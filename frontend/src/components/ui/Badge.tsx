import React from 'react';
import { cn } from '../../lib/utils';

export { cn };

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-primary/10 text-primary border-primary/20',
      success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      danger: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      outline: 'border border-border text-foreground bg-transparent',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
