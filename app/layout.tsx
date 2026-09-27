import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Geist } from 'next/font/google';
import './global.css';

const sans = Geist({ subsets: ['latin'], variable: '--font-sans' });
export const metadata: Metadata = {
  title: { default: 'pstack reader', template: '%s · pstack reader' },
  description: 'Read the pstack guide and browse its complete reference library.',
  metadataBase: new URL('https://pstack-reader.vercel.app'),
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body className={`${sans.variable} flex min-h-screen flex-col`}><RootProvider>{children}</RootProvider></body></html>;
}
