import type { Folder, Item, Node } from 'fumadocs-core/page-tree';
import { source } from './source';

function findFolder(nodes: Node[], url: string): Folder | undefined {
  for (const node of nodes) {
    if (node.type !== 'folder') continue;
    // meta.json lists `index` explicitly, so the index page is usually a child rather than `folder.index`.
    if (node.index?.url === url || node.children.some((child) => child.type === 'page' && child.url === url)) return node;
    const found = findFolder(node.children, url);
    if (found) return found;
  }
}

// The cards of a section index, in sidebar order: each child page or sub-folder with its description.
export function libraryEntries(url: string) {
  const folder = findFolder(source.getPageTree().children, url);
  if (!folder) return [];
  const pages = new Map(source.getPages().map((page) => [page.url, page]));
  const indexOf = (node: Folder) => node.index ?? node.children.find((child): child is Item => child.type === 'page' && !!pages.get(child.url)?.path.endsWith('index.mdx'));
  return folder.children.flatMap((node) => {
    const item = node.type === 'folder' ? indexOf(node) : node.type === 'page' ? node : undefined;
    const page = item && pages.get(item.url);
    return page && page.url !== url ? [{ url: page.url, title: page.data.title, description: page.data.description }] : [];
  });
}
