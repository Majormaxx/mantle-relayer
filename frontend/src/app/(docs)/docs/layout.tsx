import type { Metadata } from 'next';
import { DocsLayout } from '@/components/docs';

export const metadata: Metadata = {
  title: {
    default: 'Documentation | Mantle Gasless Relayer',
    template: '%s | Mantle Relayer Docs',
  },
  description: 'Developer documentation for Mantle Gasless Relayer - Enable gasless transactions on Mantle Network',
  openGraph: {
    title: 'Mantle Gasless Relayer Documentation',
    description: 'Developer documentation for Mantle Gasless Relayer',
    type: 'website',
  },
};

export default function DocsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsLayout>{children}</DocsLayout>;
}
