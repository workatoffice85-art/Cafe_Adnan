import React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  className,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        // Base track
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-1 focus:ring-[#C5A880]/30 disabled:opacity-50 disabled:cursor-not-allowed",
        
        // Background color states
        checked 
          ? "bg-[#C5A880] dark:bg-[#C5A880]" 
          : "bg-neutral-200 dark:bg-neutral-800",
        
        className
      )}
    >
      {/* Thumb */}
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white dark:bg-black shadow-sm ring-0 transition-transform duration-200 ease-in-out",
          
          // Thumb offset/alignment
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
};
export default Switch;
