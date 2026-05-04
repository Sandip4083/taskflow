import React from 'react';
import { cn } from '../../lib/utils';

export { cn };

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-primary/10 text-primary hover:bg-primary/20',
      success: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
      warning: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
      danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
      info: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
      outline: 'border border-border text-foreground',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
