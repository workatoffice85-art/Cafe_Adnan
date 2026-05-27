import clsx from 'clsx';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtitle?: boolean;
}

export function Logo({ size = 'md', className, showSubtitle = true }: LogoProps) {
  const sizes = {
    sm: { ar: 'text-lg', en: 'text-xs', sub: 'text-[10px]' },
    md: { ar: 'text-2xl', en: 'text-sm', sub: 'text-xs' },
    lg: { ar: 'text-4xl', en: 'text-lg', sub: 'text-sm' },
  };

  return (
    <div className={clsx('flex flex-col items-center select-none', className)}>
      <div className="flex flex-col items-center gap-0.5">
        <h1
          className={clsx(
            sizes[size].ar,
            'font-bold tracking-wide text-brand-black dark:text-brand-white'
          )}
          style={{ fontFamily: 'var(--font-cairo)' }}
        >
          قهوة عدنان
        </h1>
        <span
          className={clsx(
            sizes[size].en,
            'font-medium tracking-[0.2em] uppercase text-brand-gray-500 dark:text-brand-gray-400'
          )}
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          Cafe Adnan
        </span>
      </div>
      {showSubtitle && (
        <div
          className={clsx(
            sizes[size].sub,
            'mt-1 text-brand-beige font-medium tracking-wider'
          )}
        >
          ✦
        </div>
      )}
    </div>
  );
}
