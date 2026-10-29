import { AppRoot } from '@main/AppRoot';
import { themeInitScript } from '@presentation/theme/themeInitScript';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Demand Intelligence', template: '%s · Demand Intelligence' },
  description: 'Apsen · Demand Intelligence — Drivers de Demanda.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans">
        <AppRoot>{children}</AppRoot>
      </body>
    </html>
  );
}
