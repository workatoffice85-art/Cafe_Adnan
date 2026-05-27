'use client';

import { useState, useRef, useCallback } from 'react';
import { Download, Printer } from 'lucide-react';
import { QRCard } from '@/components/admin/QRCard';

export default function QRPage() {
  const [url, setUrl] = useState(
    typeof window !== 'undefined'
      ? `${window.location.origin}/menu`
      : process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/menu`
        : 'https://cafeadnan.com/menu'
  );
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(async () => {
    const card = document.getElementById('qr-card');
    if (!card) return;

    try {
      // Use html2canvas-like approach via SVG serialization
      const svgEl = card.querySelector('svg');
      if (!svgEl) return;

      const svgData = new XMLSerializer().serializeToString(svgEl);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = 400;
      canvas.height = 400;

      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, 400, 400);
          ctx.drawImage(img, 60, 60, 280, 280);

          const link = document.createElement('a');
          link.download = 'cafe-adnan-qr.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, []);

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-black dark:text-brand-white">رمز QR</h1>
        <p className="text-sm text-brand-gray-500 mt-1">
          اطبع رمز QR وضعه على طاولات المقهى
        </p>
      </div>

      {/* URL Input */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-brand-gray-600 dark:text-brand-gray-400 mb-1.5">
          رابط القائمة
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          dir="ltr"
          className="w-full px-4 py-3 rounded-xl text-sm bg-brand-white dark:bg-brand-gray-900 border border-brand-gray-200 dark:border-brand-gray-800 text-brand-black dark:text-brand-white focus:outline-none focus:border-brand-beige transition-colors font-mono"
        />
      </div>

      {/* QR Card Preview */}
      <div ref={printRef} className="mb-8 print-only">
        <QRCard url={url} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-xs mx-auto no-print">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-brand-black dark:bg-brand-white text-brand-white dark:text-brand-black hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <Download size={18} />
          <span>تحميل PNG</span>
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold border border-brand-gray-200 dark:border-brand-gray-700 text-brand-gray-700 dark:text-brand-gray-300 hover:bg-brand-gray-50 dark:hover:bg-brand-gray-800 active:scale-[0.98] transition-all"
        >
          <Printer size={18} />
          <span>طباعة</span>
        </button>
      </div>
    </div>
  );
}
