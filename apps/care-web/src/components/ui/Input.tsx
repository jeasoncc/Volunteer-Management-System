import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, hint, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2 text-foreground">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              'w-full px-4 py-3 rounded-lg border bg-white',
              'transition-all duration-300 ease-out',
              'placeholder:text-muted-foreground',
              'focus:outline-none',
              isFocused && 'ring-2 ring-primary/20 border-primary',
              error && 'border-red-400 ring-2 ring-red-100',
              success && 'border-green-400 ring-2 ring-green-100',
              !error && !success && !isFocused && 'border-border hover:border-primary/50',
              className
            )}
            {...props}
          />
          {(error || success) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {error && <AlertCircle className="w-5 h-5 text-red-500" />}
              {success && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1 animate-fade-in-up">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, success, hint, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2 text-foreground">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              'w-full px-4 py-3 rounded-lg border bg-white resize-none',
              'transition-all duration-300 ease-out',
              'placeholder:text-muted-foreground',
              'focus:outline-none',
              isFocused && 'ring-2 ring-primary/20 border-primary',
              error && 'border-red-400 ring-2 ring-red-100',
              success && 'border-green-400 ring-2 ring-green-100',
              !error && !success && !isFocused && 'border-border hover:border-primary/50',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1 animate-fade-in-up">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2 text-foreground">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e as any);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e as any);
          }}
          className={cn(
            'w-full px-4 py-3 rounded-lg border bg-white',
            'transition-all duration-300 ease-out',
            'focus:outline-none',
            isFocused && 'ring-2 ring-primary/20 border-primary',
            error && 'border-red-400 ring-2 ring-red-100',
            !error && !isFocused && 'border-border hover:border-primary/50',
            className
          )}
          {...(props as any)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-red-500 animate-fade-in-up">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
