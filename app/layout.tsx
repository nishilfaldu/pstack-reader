import type { Metadata, Viewport } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Fraunces, Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { shareImage, siteDescription, siteName, siteUrl } from '@/lib/site';
import './global.css';

const sans = Geist({ subsets: ['latin'], variable: '--font-sans' });
const display = Fraunces({ subsets: ['latin'], variable: '--font-display', axes: ['opsz', 'SOFT'] });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });
export const metadata: Metadata = {
  title: { default: siteName, template: `%s · ${siteName}` },
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  openGraph: {
    type: 'website',
    siteName,
    title: siteName,
    description: siteDescription,
    url: siteUrl,
    images: [{ url: shareImage, width: 1200, height: 630, alt: 'pstack — a guide and reference library for working with coding agents' }],
  },
  twitter: { card: 'summary_large_image', title: siteName, description: siteDescription, images: [shareImage] },
  icons: { icon: [{ url: '/favicon.ico', sizes: 'any' }, { url: '/icon.png', type: 'image/png', sizes: '512x512' }], apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }] },
};
export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#ffffff' }, { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }],
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body className={`${sans.variable} ${display.variable} ${mono.variable} flex min-h-screen flex-col`}><RootProvider>{children}</RootProvider><Analytics /></body></html>;
}
