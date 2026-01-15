import './globals.css';

import type { Metadata, Viewport } from 'next';

import { Web3Provider } from '@/components/web3';
import { Toaster } from '@/components/ui/toaster';

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
      <body className="font-sans antialiased min-h-screen bg-background">
        <Web3Provider>{children}</Web3Provider>
        <Toaster />
      </body>
    </html>
  );
}
