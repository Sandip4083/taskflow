import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          className={cn(
            'flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background transition-all duration-200',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-muted-foreground/60',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-0 focus-visible:border-primary/50',
            'hover:border-primary/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
            error && 'border-destructive focus-visible:ring-destructive/50 focus-visible:border-destructive'
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1 animate-fade-in">
            <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
export { Input };
