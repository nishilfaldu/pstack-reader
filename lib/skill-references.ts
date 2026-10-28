import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { source } from './source';

export type RefKind = 'pr' | 'pb' | 'sk' | 'ag';
export type Ref = { kind: RefKind; slug: string; title: string; url: string; description?: string };

export const kindNames: Record<RefKind, { one: string; many: string; index: string }> = {
  pr: { one: 'principle', many: 'principles', index: '/docs/skills/principles' },
  pb: { one: 'playbook', many: 'playbooks', index: '/docs/playbooks' },
  sk: { one: 'skill', many: 'skills', index: '/docs/skills' },
  ag: { one: 'agent', many: 'agents', index: '/docs/agents' },
};

// Every page that can be referenced, keyed by `${kind}_${slug}`; built from the synced content so it follows upstream.
function buildCatalog() {
  const catalog = new Map<string, Ref & { text: string }>();
  for (const page of source.getPages()) {
    const [section, ...rest] = page.slugs;
    let kind: RefKind | undefined;
    let slug: string | undefined;
    if (section === 'skills' && rest[0] === 'principles' && rest.length === 2) [kind, slug] = ['pr', rest[1]];
    else if (section === 'skills' && rest.length === 1 && rest[0] !== 'principles') [kind, slug] = ['sk', rest[0]];
    else if (section === 'automations' && rest[0] === 'benny' && rest[1] === 'skills' && rest.length === 3) [kind, slug] = ['sk', rest[2]];
    else if (section === 'playbooks' && rest.length === 1) [kind, slug] = ['pb', rest[0]];
    else if (section === 'agents' && rest.length === 1) [kind, slug] = ['ag', rest[0]];
    if (!kind || !slug) continue;
    const text = readFileSync(join(process.cwd(), 'content/docs', page.path), 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '');
    catalog.set(`${kind}_${slug}`, { kind, slug, title: page.data.title, url: page.url, description: page.data.description, text });
  }
  return catalog;
}

export const catalog = buildCatalog();
export const refsOfKind = (kind: RefKind) => [...catalog.values()].filter((ref) => ref.kind === kind);

const literal = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Upstream names other pages in prose more often than it links them, so each kind gets the spellings its authors use.
function mentionPatterns(ref: Ref): RegExp[] {
  const slug = literal(ref.slug);
  const title = literal(ref.title);
  const notInName = '(?![\\w-])';
  switch (ref.kind) {
    case 'pr': return [
      new RegExp(`principle-${slug}${notInName}`),
      new RegExp(`\\*\\*${slug}\\*\\*`),
      new RegExp(`\\*\\*${title}\\.?\\*\\*`, 'i'),
      new RegExp(`(?<![\\w-])${title}${notInName}`),
    ];
    case 'pb': return [
      new RegExp(`/docs/playbooks/${slug}${notInName}`),
      new RegExp(`playbooks/${slug}\\.md`),
      new RegExp(`\\*\\*${title}\\.?\\*\\*`, 'i'),
      new RegExp(`(?<![\\w-])(${title}|\`${slug}\`)\\*{0,2} playbook`, 'i'),
    ];
    case 'sk': return [
      new RegExp(`\\]\\(/docs/(skills|automations/benny/skills)/${slug}[)#]`),
      new RegExp(`(?<![\\w/.-])/${slug}${notInName}`),
      new RegExp(`\\*\\*${slug}\\*\\*`),
      new RegExp(`\`${slug}\``),
    ];
    case 'ag': return [
      new RegExp(`(?<![\\w-])${slug}${notInName}`),
      new RegExp(`(?<![\\w-])${title}${notInName}`),
    ];
  }
}

// Fenced code shows commands and file shapes, not references, so only prose counts.
const prose = (text: string) => text.replace(/```[\s\S]*?```/g, '');

const patterns = [...catalog].map(([key, ref]) => ({ key, ref, patterns: mentionPatterns(ref) }));
const found = new Map<string, Ref[]>();

export function referencesOf(key: string): Ref[] {
  const cached = found.get(key);
  if (cached) return cached;
  const self = catalog.get(key);
  const text = self ? prose(self.text) : '';
  const refs = self ? patterns.filter((other) => other.key !== key && other.patterns.some((pattern) => pattern.test(text))).map((other) => other.ref) : [];
  found.set(key, refs);
  return refs;
}

// Reverse index: which skills mention a given skill.
export function referrersOf(key: string): Ref[] {
  return refsOfKind('sk').filter((ref) => `sk_${ref.slug}` !== key && referencesOf(`sk_${ref.slug}`).some((found) => `${found.kind}_${found.slug}` === key));
}
