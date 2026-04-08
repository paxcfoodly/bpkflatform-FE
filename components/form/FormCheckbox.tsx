import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

const FormCheckbox = React.forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id ?? generatedId;

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <input
              id={checkboxId}
              ref={ref}
              type="checkbox"
              aria-invalid={!!error}
              className={cn(
                'peer h-4 w-4 shrink-0 appearance-none rounded-sm border border-input ring-offset-background',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'checked:border-primary checked:bg-primary',
                'disabled:cursor-not-allowed disabled:opacity-50',
                error && 'border-destructive',
                className,
              )}
              {...props}
            />
            <Check className="pointer-events-none absolute left-0 h-4 w-4 text-primary-foreground opacity-0 peer-checked:opacity-100" />
          </div>
          <label
            htmlFor={checkboxId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
FormCheckbox.displayName = 'FormCheckbox';

export { FormCheckbox };
