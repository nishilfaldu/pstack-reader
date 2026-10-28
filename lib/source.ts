import { defineDocs } from 'fumadocs-mdx/macro';
import { loader } from 'fumadocs-core/source';
import { createElement, Fragment } from 'react';
import { sidebarTitle } from './sidebar-title';
import { chapterHref, chapters } from './chapters';

const docs = defineDocs({ dir: 'content/docs' });
// Keep slash commands like /poteto-mode on one line in the narrow sidebar.
const keepCommands = (name: string) => name.split(/(\/[a-z][\w-]*)/).map((part, i) => i % 2 ? createElement('span', { key: i, className: 'nowrap' }, part) : part);
const chapterNumbers = new Map(chapters.slice(1).map((chapter, i) => [chapterHref(chapter.slug), String(i + 1).padStart(2, '0')]));

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: ({ typedPlugin }) => [typedPlugin({
    transformPageTree: {
      file(node) {
        if (typeof node.name !== 'string') return node;
        const name = sidebarTitle(node.name, node.url);
        const number = chapterNumbers.get(node.url);
        node.name = number ? createElement(Fragment, null, createElement('span', { className: 'sidebar-chapter-number' }, number), createElement('span', null, ...keepCommands(name))) : name;
        return node;
      },
      folder(node) {
        if (typeof node.name === 'string') node.name = sidebarTitle(node.name);
        return node;
      },
      separator(node) {
        if (node.name) node.name = createElement('span', { className: 'sidebar-label' }, node.name);
        return node;
      },
      // The skill flows page is built in code, not synced, so it joins the reference library right after Skills.
      root(node) {
        const skills = node.children.findIndex((child) => child.type === 'folder' && child.children.some((item) => item.type === 'page' && item.url === '/docs/skills'));
        node.children.splice(skills + 1, 0, { type: 'page', name: 'Skill flows', url: '/docs/skill-flows' });
        return node;
      },
    },
  })],
});
