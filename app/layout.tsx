import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Geist, Source_Serif_4 } from 'next/font/google';
import './global.css';

const sans = Geist({ subsets: ['latin'], variable: '--font-sans' });
const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif' });
export const metadata: Metadata = {
  title: { default: 'pstack reader', template: '%s · pstack reader' },
  description: 'Read the pstack guide from start to finish.',
  metadataBase: new URL('https://pstack-reader.vercel.app'),
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body className={`${sans.variable} ${serif.variable} flex min-h-screen flex-col`}><RootProvider>{children}</RootProvider></body></html>;
}
