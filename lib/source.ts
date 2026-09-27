import { defineDocs } from 'fumadocs-mdx/macro';
import { loader } from 'fumadocs-core/source';
import { sidebarTitle } from './sidebar-title';

const docs = defineDocs({ dir: 'content/docs' });
export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: ({ typedPlugin }) => [typedPlugin({
    transformPageTree: {
      file(node) {
        if (typeof node.name === 'string') node.name = sidebarTitle(node.name, node.url);
        return node;
      },
      folder(node) {
        if (typeof node.name === 'string') node.name = sidebarTitle(node.name);
        return node;
      },
    },
  })],
});
