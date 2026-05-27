'use client';

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Logo } from '@/components/Logo';

interface QRCardProps {
  url: string;
}

export function QRCard({ url }: QRCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      id="qr-card"
      className="bg-white rounded-3xl p-8 shadow-lg max-w-xs mx-auto border border-gray-100"
    >
      {/* Logo */}
      <div className="mb-6">
        <Logo size="md" forceInvert={true} />
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-white rounded-2xl">
          <QRCodeSVG
            value={url}
            size={180}
            level="H"
            bgColor="transparent"
            fgColor="#0a0a0a"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      </div>

      {/* Text */}
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'var(--font-cairo)' }}>
          امسح للقائمة
        </p>
        <p className="text-xs text-gray-500" style={{ fontFamily: 'var(--font-inter)' }}>
          Scan to view menu
        </p>
      </div>

      {/* Decorative Line */}
      <div className="mt-6 pt-4 border-t border-gray-100 text-center">
        <span className="text-[10px] text-gray-400 tracking-widest uppercase" style={{ fontFamily: 'var(--font-inter)' }}>
          Cafe Adnan
        </span>
      </div>
    </div>
  );
}
