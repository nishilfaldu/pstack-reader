import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { source } from '@/lib/source';
import { chapters, chapterHref } from '@/lib/chapters';
import { getMDXComponents } from '@/components/mdx';

type Params = Promise<{ slug?: string[] }>;
export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const index = chapters.findIndex((chapter) => chapter.slug === (slug?.[0] ?? ''));
  const previous = chapters[index - 1];
  const next = chapters[index + 1];
  const MDX = page.data.body;
  return <DocsPage toc={page.data.toc} tableOfContent={{ enabled: false }} footer={{ enabled: false }}>
    <div className="chapter-meta">{index === 0 ? 'Start here' : `Chapter ${String(index).padStart(2, '0')} of 10`}</div>
    <DocsTitle>{page.data.title}</DocsTitle>
    {index === 0 && <DocsDescription>A practical guide to rigorous agent workflows. Read it in order the first time.</DocsDescription>}
    <DocsBody><MDX components={getMDXComponents()} /></DocsBody>
    <nav className="chapter-navigation" aria-label="Chapter navigation">
      {previous ? <Link href={chapterHref(previous.slug)} className="chapter-link"><span>Previous chapter</span><strong>← {previous.title}</strong></Link> : <span />}
      {next ? <Link href={chapterHref(next.slug)} className="chapter-link next"><span>Next chapter</span><strong>{next.title} →</strong></Link> : <Link href="/docs" className="chapter-link next"><span>Finished the guide</span><strong>Back to the start →</strong></Link>}
    </nav>
    <p className="source-note">Text from <a href="https://github.com/cursor/plugins/tree/main/pstack/docs/guide">the pstack plugin</a> by Lauren Tan.</p>
  </DocsPage>;
}
export function generateStaticParams() { return source.generateParams(); }
export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  return { title: page.data.title, description: page.data.description };
}
