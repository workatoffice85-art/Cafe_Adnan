import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-[1.5px]',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-2',
  };

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div
        className={clsx(
          sizes[size],
          'rounded-full border-brand-gray-200 dark:border-brand-gray-700 border-t-brand-beige animate-spin'
        )}
      />
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-brand-gray-400 font-medium">جاري التحميل...</p>
      </div>
    </div>
  );
}
