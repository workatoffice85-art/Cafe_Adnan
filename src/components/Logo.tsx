import clsx from 'clsx';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtitle?: boolean;
}

export function Logo({ size = 'md', className, showSubtitle = true }: LogoProps) {
  const sizes = {
    sm: 'h-11 w-auto',
    md: 'h-24 w-auto',
    lg: 'h-36 w-auto',
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
