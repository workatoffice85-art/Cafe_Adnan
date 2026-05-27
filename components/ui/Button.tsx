import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        // Base classes
        "inline-flex items-center justify-center font-medium rounded-sm transition-all duration-250 outline-none focus:ring-1 focus:ring-[#C5A880]/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]",
        
        // Size variants
        {
          "px-3 py-1.5 text-xs tracking-wider": size === 'sm',
          "px-5 py-2.5 text-sm tracking-widest": size === 'md',
          "px-8 py-3.5 text-base tracking-widest": size === 'lg',
        },

        // Color variants
        {
          // Primary: Solid Monochrome Black (Light Mode) / White (Dark Mode)
          "bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100": variant === 'primary',
          
          // Secondary: Thin Elegant Border Outline
          "border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900": variant === 'secondary',
          
          // Accent: Premium Warm Coffee Beige
          "bg-[#C5A880] text-black hover:bg-[#D4BD96]": variant === 'accent',
          
          // Danger: Sleek Luxury Crimson/Rose
          "bg-rose-950/20 text-rose-500 border border-rose-950/50 hover:bg-rose-500 hover:text-white": variant === 'danger',
          
          // Ghost: Transparent with minimal hover
          "bg-transparent text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900/50": variant === 'ghost',
        },
        
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};
export default Button;
