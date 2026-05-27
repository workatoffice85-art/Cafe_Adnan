import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'monochrome' | 'gold' | 'default';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'default' 
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'sm': return { width: 48, height: 48 };
      case 'lg': return { width: 140, height: 140 };
      case 'xl': return { width: 220, height: 220 };
      case 'md':
      default: return { width: 90, height: 90 };
    }
  };

  const { width, height } = getDimensions();

  // Determine gold accent color based on premium coffee beige
  const goldColor = '#C5A880';
  const primaryColor = variant === 'monochrome' ? 'currentColor' : '#ffffff';

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-105"
      >
        {/* Steam rising */}
        <path
          d="M85 30C87 23 93 23 95 18C97 23 103 23 105 18C107 23 113 23 115 18"
          stroke={goldColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Coffee Cup Symbol */}
        <path
          d="M80 35H120C120 35 120 52 100 52C80 52 80 35 80 35Z"
          fill="none"
          stroke={goldColor}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M120 40H125C128 40 128 45 125 45H120"
          stroke={goldColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M75 56H125"
          stroke={goldColor}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Elegant Arabic Calligraphy 'قهوة عدنان' representation in SVG paths */}
        {/* 'عدنان' main cursive stroke */}
        <path
          d="M50 120C75 140 135 140 155 110C165 95 155 75 135 85C115 95 105 125 70 125C50 125 40 110 50 95C55 85 70 85 75 95"
          stroke={primaryColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="dark:stroke-white stroke-black"
        />

        {/* Diacritics and secondary letter curves */}
        <path
          d="M135 115C135 118 138 120 140 118"
          stroke={goldColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M85 90C85 93 88 95 90 93"
          stroke={goldColor}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Cursive English 'Cafe' */}
        <text
          x="100"
          y="72"
          textAnchor="middle"
          fill={goldColor}
          style={{
            fontFamily: "'Playfair Display', 'Georgia', serif",
            fontStyle: 'italic',
            fontWeight: 'bold',
            fontSize: '18px',
            letterSpacing: '1px'
          }}
        >
          Cafe
        </text>

        {/* 'Adnan' English text */}
        <text
          x="100"
          y="160"
          textAnchor="middle"
          fill={primaryColor}
          className="dark:fill-white fill-black font-bold uppercase tracking-[0.25em]"
          style={{
            fontFamily: "'Inter', 'Montserrat', sans-serif",
            fontSize: '16px'
          }}
        >
          Adnan
        </text>
      </svg>
    </div>
  );
};
export default Logo;
