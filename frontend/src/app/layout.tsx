import './globals.css';

import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

import { Web3Provider } from '@/components/web3';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Mantle Gasless Relayer',
    template: '%s | Mantle Gasless Relayer',
  },
  description:
    'Let your users transact without gas. Deploy Paymasters to sponsor transactions on Mantle.',
  keywords: ['Mantle', 'Gasless', 'Relayer', 'Paymaster', 'Web3', 'Blockchain', 'Gas Sponsorship'],
  authors: [{ name: 'Mantle Gasless Relayer Team' }],
  creator: 'Mantle Gasless Relayer',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Mantle Gasless Relayer',
    title: 'Mantle Gasless Relayer',
    description: 'Let your users transact without gas on Mantle.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mantle Gasless Relayer',
    description: 'Let your users transact without gas on Mantle.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#09090B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background`}
      >
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
