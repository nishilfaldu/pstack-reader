import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DocsLayout tree={source.getPageTree()} nav={{ title: <span className="brand"><img src="/logo.png" alt="" />pstack<span className="brand-divider">/</span>reader</span>, url: '/docs' }} sidebar={{ collapsible: false }}>
    {children}
  </DocsLayout>;
}
