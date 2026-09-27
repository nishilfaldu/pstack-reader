import Link from 'next/link';
import Image from 'next/image';
import { ReaderDisclaimer } from '@/components/reader-disclaimer';

export default function NotFound() {
  return <main className="not-found">
    <div className="not-found-inner">
      <Link href="/docs" className="not-found-brand" aria-label="pstack guide"><Image src="/potato.png" width={56} height={44} alt="" />pstack</Link>
      <p className="not-found-number">404</p>
      <h1>This page isn’t in the reader.</h1>
      <p>It may have moved, or the address may have a typo. Start with the guide or browse the reference library.</p>
      <div className="not-found-links">
        <Link href="/docs">Read the guide</Link>
        <Link href="/docs/playbooks">Browse playbooks</Link>
      </div>
      <footer className="reader-disclaimer reader-disclaimer-footer"><ReaderDisclaimer /></footer>
    </div>
  </main>;
}
