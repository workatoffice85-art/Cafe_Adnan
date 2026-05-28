import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/providers/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cafe Adnan | قهوة عدنان',
  description: 'قائمة قهوة عدنان الرقمية — اكتشف أجود أنواع القهوة والمشروبات والحلويات. Cafe Adnan digital menu — Discover premium coffee, drinks, and desserts.',
  keywords: ['cafe adnan', 'قهوة عدنان', 'menu', 'قائمة', 'coffee', 'قهوة'],
  authors: [{ name: 'Cafe Adnan' }],
  openGraph: {
    title: 'Cafe Adnan | قهوة عدنان',
    description: 'قائمة قهوة عدنان الرقمية — Premium cafe digital menu',
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('cafe-adnan-theme');
                if (theme !== 'light') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-brand-white dark:bg-brand-black text-brand-black dark:text-brand-white transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
