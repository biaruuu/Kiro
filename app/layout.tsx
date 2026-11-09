import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const inter = localFont({
  src: [
    { path: '../fonts/inter_regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/inter_medium.ttf', weight: '500', style: 'normal' },
    { path: '../fonts/inter_semibold.ttf', weight: '600', style: 'normal' },
    { path: '../fonts/inter_bold.ttf', weight: '700', style: 'normal' },
  ],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kiro – Download for Android',
  description: 'Kiro by AniBiar TV: stream anime, watch together with friends, chat and more. Download the latest Android app.',
  openGraph: {
    title: 'Kiro – Download for Android',
    description: 'Stream anime, watch together with friends, chat and more.',
    images: ['/icon.png'],
  },
};

export const viewport: Viewport = { themeColor: '#0b0b0d', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
