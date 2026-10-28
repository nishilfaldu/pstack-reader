import { renderMermaidSVG } from 'beautiful-mermaid';
import { flowGroups, flows } from './skill-flows';
import { catalog, kindNames, refsOfKind, referencesOf, referrersOf, type Ref, type RefKind } from './skill-references';

const kinds: RefKind[] = ['pr', 'pb', 'sk', 'ag'];
const token = /(?<![\w-])(pr|pb|sk|ag)_([a-z0-9-]+)(?![\w-])/g;
// More undrawn references of one kind than this collapse into a single "All N" node.
const collapseAfter = 5;

const shape: Record<RefKind, (label: string) => string> = {
  pr: (label) => `(["${label}"])`,
  pb: (label) => `{{"${label}"}}`,
  sk: (label) => `[["${label}"]]`,
  ag: (label) => `("${label}")`,
};

function warn(message: string) {
  console.warn(`::warning title=Skill flows::${message}`);
}

function resolve(kind: RefKind, slug: string, more: Map<RefKind, string>): { label: string; url?: string } {
  if (slug === 'all') return { label: `All ${refsOfKind(kind).length} ${kindNames[kind].many}`, url: kindNames[kind].index };
  if (slug === 'more') return { label: more.get(kind) ?? kindNames[kind].many, url: kindNames[kind].index };
  const ref = catalog.get(`${kind}_${slug}`);
  if (!ref) {
    warn(`chart names ${kind}_${slug}, which no synced ${kindNames[kind].one} matches`);
    return { label: slug };
  }
  return { label: kind === 'sk' ? `/${ref.slug}` : ref.title, url: ref.url };
}

export type SkillFlow = Ref & { svg: string; references: Ref[]; referrers: Ref[]; curated: boolean };

function buildFlow(skill: Ref): SkillFlow {
  const key = `sk_${skill.slug}`;
  const curated = skill.slug in flows;
  if (!curated) warn(`/${skill.slug} has no curated chart in lib/skill-flows.ts; showing only its references`);
  let chart = flows[skill.slug] ?? `flowchart TD\n  A["/${skill.slug}"]`;

  const drawn = new Set([...chart.matchAll(token)].map((match) => `${match[1]}_${match[2]}`));
  const references = referencesOf(key);
  const missing = references.filter((ref) => !drawn.has(`${ref.kind}_${ref.slug}`) && !drawn.has(`${ref.kind}_all`));
  // Undrawn references hang off the step named by `%% attach: <id>`, or the first step.
  const anchor = chart.match(/%% attach: ([\w-]+)/)?.[1] ?? chart.split('\n')[1]?.trim().match(/^[\w-]+/)?.[0] ?? 'A';
  const more = new Map<RefKind, string>();
  for (const kind of kinds) {
    const undrawn = missing.filter((ref) => ref.kind === kind);
    const someDrawn = [...drawn].some((id) => id.startsWith(`${kind}_`));
    if (undrawn.length > collapseAfter) more.set(kind, `${undrawn.length} ${someDrawn ? 'more ' : ''}${kindNames[kind].many}`);
    const ids = undrawn.length > collapseAfter ? [`${kind}_more`] : undrawn.map((ref) => `${kind}_${ref.slug}`);
    for (const id of ids) chart += `\n  ${id} -.- ${anchor}`;
  }

  // Label each reference node where it first appears so the layout keeps the author's order.
  const declared = new Set<string>();
  const links = new Map<string, { label: string; url?: string }>();
  chart = chart.replace(token, (id, kind: RefKind, slug: string) => {
    if (declared.has(id)) return id;
    declared.add(id);
    const target = resolve(kind, slug, more);
    links.set(id, target);
    return `${id}${shape[kind](target.label.replaceAll('"', "'"))}`;
  });

  const rendered = renderMermaidSVG(chart, { bg: 'var(--color-fd-card)', fg: 'var(--color-fd-foreground)', transparent: true });
  // Wide charts shrink to the column, but never below 70% of their size; past that the frame scrolls.
  const width = Number(rendered.match(/viewBox="0 0 ([\d.]+)/)?.[1] ?? 0);
  const svg = rendered
    .replace('style="', `style="width:100%;max-width:${Math.ceil(width)}px;min-width:${Math.round(width * 0.7)}px;`)
    .replace(/<g class="node" data-id="([^"]+)"[\s\S]*?<\/g>/g, (node, id: string) => {
      const target = links.get(id);
      return target?.url ? `<a href="${target.url}" class="flow-ref"><title>${target.label}</title>${node}</a>` : node;
    });
  return { ...skill, svg, references, referrers: referrersOf(key), curated };
}

export function skillFlowGroups() {
  const skills = refsOfKind('sk');
  for (const slug of Object.keys(flows)) if (!skills.some((skill) => skill.slug === slug)) warn(`lib/skill-flows.ts has a chart for /${slug}, which upstream no longer ships`);
  const grouped = new Set(flowGroups.flatMap((group) => group.skills));
  const groups = [...flowGroups, { title: 'More skills', blurb: 'Skills added upstream since these groups were drawn.', skills: skills.map((skill) => skill.slug).filter((slug) => !grouped.has(slug)) }];
  return groups
    .map((group) => ({ ...group, flows: group.skills.flatMap((slug) => {
      const skill = skills.find((candidate) => candidate.slug === slug);
      return skill ? [buildFlow(skill)] : [];
    }) }))
    .filter((group) => group.flows.length > 0);
}
