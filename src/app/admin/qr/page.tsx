'use client';

import { useState, useRef, useCallback } from 'react';
import { Download, Printer } from 'lucide-react';
import { QRCard } from '@/components/admin/QRCard';

export default function QRPage() {
  const [url, setUrl] = useState(
    typeof window !== 'undefined'
      ? `${window.location.origin}`
      : process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}`
        : 'https://cafeadnan.com'
  );
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(async () => {
    const card = document.getElementById('qr-card');
    if (!card) return;

    try {
      const svgEl = card.querySelector('svg');
      if (!svgEl) return;

      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 900;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Load brand logo first
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';

      logoImg.onload = () => {
        // 2. Load QR Code SVG image
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const qrImg = new Image();

        qrImg.onload = () => {
          // --- BEGIN DRAWING ---

          // Clear with white background
          ctx.fillStyle = '#ffffff';
          // Draw rounded rectangle container
          const x = 0, y = 0, width = 600, height = 900, radius = 40;
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + width - radius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
          ctx.lineTo(x + width, y + height - radius);
          ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          ctx.lineTo(x + radius, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fill();

          // Draw a very subtle outline border
          ctx.strokeStyle = '#f3f4f6';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Draw the Calligraphic Brand Logo (Inverted to be black on white background)
          ctx.save();
          ctx.filter = 'invert(100%)';
          const logoWidth = 240;
          const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
          ctx.drawImage(logoImg, (600 - logoWidth) / 2, 70, logoWidth, logoHeight);
          ctx.restore();

          // Draw the QR Code centered
          const qrSize = 360;
          ctx.drawImage(qrImg, (600 - qrSize) / 2, 280, qrSize, qrSize);

          // Draw bilingual texts
          ctx.textAlign = 'center';

          // Arabic Text
          ctx.fillStyle = '#1f2937'; // text-gray-800
          ctx.font = 'bold 28px Cairo, system-ui, sans-serif';
          ctx.fillText('امسح للقائمة', 300, 700);

          // English Text
          ctx.fillStyle = '#6b7280'; // text-gray-500
          ctx.font = '500 20px Inter, system-ui, sans-serif';
          ctx.fillText('Scan to view menu', 300, 745);

          // Divider Line
          ctx.strokeStyle = '#f3f4f6';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(80, 800);
          ctx.lineTo(520, 800);
          ctx.stroke();

          // Bottom Footer Text
          ctx.fillStyle = '#9ca3af';
          ctx.font = '500 16px Inter, system-ui, sans-serif';
          ctx.fillText('C A F E   A D N A N', 300, 850);

          // --- DOWNLOAD TRIGGER ---
          const link = document.createElement('a');
          link.download = 'cafe-adnan-qr-card.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        };

        qrImg.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      };

      logoImg.src = '/logo.png';
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
