'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Logo } from './Logo';
import { useLanguage } from '@/hooks/useLanguage';

interface QRCardProps {
  value: string;
}

export const QRCard: React.FC<QRCardProps> = ({ value }) => {
  const { language, t } = useLanguage();

  return (
    <div 
      className="w-[280px] p-6 bg-white text-black border border-neutral-200 shadow-xl rounded-sm flex flex-col items-center justify-between transition-shadow duration-300 hover:shadow-2xl select-none print:shadow-none print:border-none print:p-0"
      style={{ aspectRatio: '1 / 1.5' }}
    >
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mt-2">
        <Logo variant="monochrome" size="sm" className="scale-90 text-black dark:text-black" />
        <span className="font-bold text-sm tracking-widest uppercase text-black mt-2">
          {language === 'ar' ? 'قهوة عدنان' : 'Cafe Adnan'}
        </span>
        <span className="text-[8px] font-bold tracking-widest text-[#C5A880] uppercase mt-1">
          {t.brandSub}
        </span>
      </div>

      {/* QR Code Container */}
      <div className="relative p-4 border border-neutral-100 bg-neutral-50/50 rounded-sm flex items-center justify-center">
        <QRCodeSVG
          value={value}
          size={140}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          includeMargin={false}
          imageSettings={{
            src: '', // We can load custom favicon or emblem in the middle
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
        {/* Subtle decorative corners */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-neutral-400" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-neutral-400" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-neutral-400" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-neutral-400" />
      </div>

      {/* Instruction Footer */}
      <div className="text-center mb-2">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-black">
          {t.scanMenu}
        </p>
        <p className="text-[9px] font-semibold text-neutral-500 mt-0.5 max-w-[200px] leading-snug">
          {t.toViewMenu}
        </p>
        <p className="text-[8px] font-mono text-neutral-400 mt-3 tracking-wider select-text break-all max-w-[220px]">
          {value}
        </p>
      </div>
    </div>
  );
};
export default QRCard;
