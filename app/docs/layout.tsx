import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import Image from 'next/image';
import { source } from '@/lib/source';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DocsLayout
    tree={source.getPageTree()}
    nav={{ title: <span className="brand"><Image src="/potato.png" width={31} height={25} alt="Yellow potato" className="brand-potato" />pstack</span>, url: '/docs' }}
    sidebar={{ defaultOpenLevel: 1 }}
  >{children}</DocsLayout>;
}
