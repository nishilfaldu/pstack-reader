import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function stripMarkdown(text: string) {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function pageDescription(slug: string[] | undefined, title: string) {
  const directory = join(process.cwd(), 'content', 'docs');
  const path = join(directory, ...(slug?.length ? slug : ['index']));
  const filename = existsSync(`${path}.mdx`) ? `${path}.mdx` : join(path, 'index.mdx');
  if (!existsSync(filename)) return `${title} in the pstack reference library.`;

  const body = readFileSync(filename, 'utf8').replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
  const paragraphs = body.split(/\n\s*\n/);
  for (const paragraph of paragraphs) {
    const candidate = paragraph.trim();
    if (!candidate || /^(#|[-*] |\d+\. |```|~~~|!\[|\||>|<)/.test(candidate)) continue;
    const description = stripMarkdown(candidate);
    if (description.length < 35) continue;
    if (description.length <= 155) return description;
    const cut = description.slice(0, 153).lastIndexOf(' ');
    return `${description.slice(0, cut > 90 ? cut : 153).replace(/[,;:]$/, '')}…`;
  }
  return `${title} in the pstack reference library.`;
}
