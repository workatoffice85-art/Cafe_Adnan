import clsx from 'clsx';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtitle?: boolean;
}

export function Logo({ size = 'md', className, showSubtitle = true }: LogoProps) {
  const sizes = {
    sm: 'h-16 md:h-18 w-auto',
    md: 'h-28 md:h-32 w-auto',
    lg: 'h-40 md:h-44 w-auto',
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center select-none', className)}>
      <img
        src="/logo.png"
        alt="Cafe Adnan | قهوة عدنان"
        className={clsx(
          sizes[size],
          'object-contain transition-all duration-200',
          'invert dark:invert-0'
        )}
      />
    </div>
  );
}
