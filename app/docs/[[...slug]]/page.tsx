import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { source } from '@/lib/source';
import { chapters, chapterHref } from '@/lib/chapters';
import upstreamPaths from '@/lib/upstream-paths.json';
import { getMDXComponents } from '@/components/mdx';

type Params = Promise<{ slug?: string[] }>;
const upstreamBase = 'https://github.com/cursor/plugins/blob/main/pstack/';

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const route = slug?.join('/') ?? '';
  const index = chapters.findIndex((chapter) => chapter.slug === route);
  const isGuide = index !== -1;
  const previous = chapters[index - 1];
  const next = chapters[index + 1];
  const sourcePath = upstreamPaths[route as keyof typeof upstreamPaths];
  const MDX = page.data.body;

  return <DocsPage toc={page.data.toc} footer={{ enabled: !isGuide }}>
    {isGuide && <div className="chapter-meta">{index === 0 ? 'Start here' : `Chapter ${String(index).padStart(2, '0')} of 10`}</div>}
    <DocsTitle>{page.data.title}</DocsTitle>
    {index === 0 && <DocsDescription>Read the guide in order, then use the reference library to find a skill or playbook.</DocsDescription>}
    <DocsBody><MDX components={getMDXComponents()} /></DocsBody>
    {index === 0 && <section className="reference-shelves" aria-labelledby="reference-library-title">
      <h2 id="reference-library-title">Reference library</h2>
      <div>
        <Link href="/docs/playbooks"><strong>Playbooks</strong><span>23 workflows for planning, building, and shipping.</span></Link>
        <Link href="/docs/skills"><strong>Skills</strong><span>Every skill, principle, and nested reference file.</span></Link>
        <Link href="/docs/agents"><strong>Agents</strong><span>Instructions for pstack's specialist agents.</span></Link>
        <Link href="/docs/automations/benny"><strong>Benny</strong><span>The automation pack, its skills, and templates.</span></Link>
      </div>
    </section>}
    {isGuide && <nav className="chapter-navigation" aria-label="Chapter navigation">
      {previous ? <Link href={chapterHref(previous.slug)} className="chapter-link"><span>Previous chapter</span><strong>← {previous.title}</strong></Link> : <span />}
      {next ? <Link href={chapterHref(next.slug)} className="chapter-link next"><span>Next chapter</span><strong>{next.title} →</strong></Link> : <Link href="/docs/playbooks" className="chapter-link next"><span>Finished the guide</span><strong>Explore the reference library →</strong></Link>}
    </nav>}
    {sourcePath && <p className="source-note">Source: <a href={upstreamBase + sourcePath} target="_blank" rel="noreferrer">cursor/plugins · {sourcePath}</a></p>}
  </DocsPage>;
}
export function generateStaticParams() { return source.generateParams(); }
export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  return { title: page.data.title, description: page.data.description };
}
