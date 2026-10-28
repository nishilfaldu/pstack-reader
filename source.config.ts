import { remarkMdxMermaid } from 'fumadocs-core/mdx-plugins';
import { defineConfig } from 'fumadocs-mdx/config';
import type { Heading, Root } from 'mdast';
import { toString } from 'mdast-util-to-string';

// Many upstream files open with a heading that repeats the page title; DocsTitle already shows it.
function remarkDropTitleHeading() {
  return (tree: Root, file: { data: object }) => {
    const { frontmatter } = file.data as { frontmatter?: { title?: string } };
    const title = frontmatter?.title?.trim().toLowerCase();
    const first = tree.children[0];
    if (title && first?.type === 'heading' && toString(first as Heading).trim().toLowerCase() === title) tree.children.shift();
  };
}

export default defineConfig({
  mdxOptions: { remarkPlugins: [remarkDropTitleHeading, remarkMdxMermaid] },
});
