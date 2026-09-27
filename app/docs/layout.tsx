import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DocsLayout
    tree={source.getPageTree()}
    nav={{ title: <span className="brand"><span className="brand-mark">p</span>pstack</span>, url: '/docs' }}
    sidebar={{ defaultOpenLevel: 1 }}
  >{children}</DocsLayout>;
}
