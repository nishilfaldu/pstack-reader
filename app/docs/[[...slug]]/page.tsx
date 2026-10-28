import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { source } from '@/lib/source';
import { chapters, chapterHref } from '@/lib/chapters';
import { getMDXComponents } from '@/components/mdx';
import { ReaderDisclaimer } from '@/components/reader-disclaimer';
import { pageDescription } from '@/lib/page-description';
import { docsUrl, shareImage, siteName } from '@/lib/site';
import { upstreamSource } from '@/lib/upstream';
import { libraryEntries } from '@/lib/library';
import { LibraryShelves } from '@/components/library-shelves';
import type { Metadata } from 'next';

type Params = Promise<{ slug?: string[] }>;

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const route = slug?.join('/') ?? '';
  const index = chapters.findIndex((chapter) => chapter.slug === route);
  const isGuide = index !== -1;
  const previous = chapters[index - 1];
  const next = chapters[index + 1];
  const MDX = page.data.body;
  const origin = isGuide ? undefined : upstreamSource(route);
  const entries = isGuide || origin ? [] : libraryEntries(page.url);

  return <DocsPage toc={page.data.toc} footer={{ enabled: !isGuide }}>
    {isGuide && <div className="chapter-meta">{index === 0 ? 'Start here' : `Chapter ${String(index).padStart(2, '0')} of 10`}</div>}
    <DocsTitle>{page.data.title}</DocsTitle>
    {index === 0 && <div className="start-row">
      <Link href={chapterHref(chapters[1].slug)} className="start-primary">Start with chapter 1 →</Link>
      <a href="#reference-library" className="start-secondary">Browse the reference library</a>
    </div>}
    {origin && <a href={origin.url} className="page-source">{origin.path}<span aria-hidden> ↗</span></a>}
    {entries.length > 0 ? <>
      <DocsDescription className="library-intro">{page.data.description}</DocsDescription>
      <Cards className="library-cards">{entries.map((entry) => <Card key={entry.url} href={entry.url} title={entry.title} description={entry.description} />)}</Cards>
    </> : <DocsBody><MDX components={getMDXComponents()} /></DocsBody>}
    {index === 0 && <LibraryShelves />}
    {isGuide && <nav className="chapter-navigation" aria-label="Chapter navigation">
      {previous ? <Link href={chapterHref(previous.slug)} className="chapter-link"><span>Previous chapter</span><strong>← {previous.title}</strong></Link> : <span />}
      {next ? <Link href={chapterHref(next.slug)} className="chapter-link next"><span>Next chapter</span><strong>{next.title} →</strong></Link> : <Link href="/docs/playbooks" className="chapter-link next"><span>Finished the guide</span><strong>Explore the reference library →</strong></Link>}
    </nav>}
    <footer className="reader-disclaimer reader-disclaimer-footer"><ReaderDisclaimer /></footer>
  </DocsPage>;
}
export function generateStaticParams() { return source.generateParams(); }
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const title = page.data.title;
  const description = page.data.description || pageDescription(slug, title);
  const url = docsUrl(slug);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'article', siteName, title, description, url, images: [{ url: shareImage, width: 1200, height: 630, alt: 'pstack guide and reference library' }] },
    twitter: { card: 'summary_large_image', title, description, images: [shareImage] },
  };
}
