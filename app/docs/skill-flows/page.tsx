import Link from 'next/link';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { Heading } from 'fumadocs-ui/components/heading';
import { ReaderDisclaimer } from '@/components/reader-disclaimer';
import { pageDescription } from '@/lib/page-description';
import { docsUrl, shareImage, siteName } from '@/lib/site';
import { skillFlowGroups, type SkillFlow } from '@/lib/skill-flow-chart';
import { kindNames, type Ref, type RefKind } from '@/lib/skill-references';
import type { Metadata } from 'next';

const title = 'Skill flows';
const description = 'Every pstack skill drawn as a flow, with the principles, playbooks, skills, and agents it draws on.';
const anchor = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Frontmatter descriptions lead with what a skill does; the few that lead with trigger phrases fall back to the body.
function summary(flow: SkillFlow) {
  const first = flow.description?.match(/^(.+?[.!?])(?=\s+[A-Z"'`(]|$)/)?.[1];
  if (first && !/^Use\b/.test(first)) return first;
  return pageDescription(flow.url.replace(/^\/docs\//, '').split('/'), flow.title);
}

const chip = (ref: Ref) => <li key={ref.url}>
  <Link href={ref.url} className={`flow-chip flow-chip-${ref.kind}`} title={kindNames[ref.kind].one}>{ref.kind === 'sk' ? `/${ref.slug}` : ref.title}</Link>
</li>;

// A kind with more references than fit on a line or two folds behind its count.
function RefList({ label, refs }: { label: string; refs: Ref[] }) {
  if (!refs.length) return null;
  const kinds: RefKind[] = ['pr', 'pb', 'sk', 'ag'];
  return <div className="flow-refs">
    <span className="flow-refs-label">{label}</span>
    {kinds.map((kind) => {
      const ofKind = refs.filter((ref) => ref.kind === kind);
      if (ofKind.length <= 8) return <ul key={kind}>{ofKind.map(chip)}</ul>;
      return <details key={kind} className="flow-more">
        <summary className={`flow-chip flow-chip-${kind}`}>{ofKind.length} {kindNames[kind].many}</summary>
        <ul>{ofKind.map(chip)}</ul>
      </details>;
    })}
  </div>;
}

export default function Page() {
  const groups = skillFlowGroups();
  const toc = groups.flatMap((group) => [
    { title: group.title, url: `#${anchor(group.title)}`, depth: 2 },
    ...group.flows.map((flow) => ({ title: `/${flow.slug}`, url: `#${flow.slug}`, depth: 3 })),
  ]);
  const count = groups.reduce((sum, group) => sum + group.flows.length, 0);

  return <DocsPage toc={toc} footer={{ children: <footer className="reader-disclaimer reader-disclaimer-footer"><ReaderDisclaimer /></footer> }}>
    <DocsTitle>{title}</DocsTitle>
    <DocsDescription className="library-intro">{`All ${count} skills, each drawn as the steps it runs. Dotted lines mark where a skill reaches for a principle, a playbook, another skill, or an agent. Click any of those to open it.`}</DocsDescription>
    <ul className="flow-legend" aria-label="Diagram key">
      <li><span className="flow-key flow-key-step" />Step</li>
      <li><span className="flow-key flow-key-decision" />Decision</li>
      <li><span className="flow-key flow-key-loop" />Loops back</li>
      <li><span className="flow-key flow-key-pr" />Principle</li>
      <li><span className="flow-key flow-key-pb" />Playbook</li>
      <li><span className="flow-key flow-key-sk" />Skill</li>
      <li><span className="flow-key flow-key-ag" />Agent</li>
    </ul>
    <DocsBody className="skill-flows-body">
      {groups.map((group) => <section key={group.title} className="flow-group">
        <Heading as="h2" id={anchor(group.title)}>{group.title}</Heading>
        <p>{group.blurb}</p>
        {group.flows.map((flow) => <section key={flow.slug} className="skill-flow">
          <Heading as="h3" id={flow.slug}>/{flow.slug}</Heading>
          <p className="skill-flow-summary">{summary(flow)} <Link href={flow.url}>Read the skill</Link></p>
          <figure className="mermaid-diagram skill-flow-diagram" aria-label={`Flow of /${flow.slug}`} dangerouslySetInnerHTML={{ __html: flow.svg }} />
          <RefList label="Draws on" refs={flow.references} />
          <RefList label="Used by" refs={flow.referrers} />
        </section>)}
      </section>)}
    </DocsBody>
  </DocsPage>;
}

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: docsUrl(['skill-flows']) },
  openGraph: { type: 'article', siteName, title, description, url: docsUrl(['skill-flows']), images: [{ url: shareImage, width: 1200, height: 630, alt: 'pstack guide and reference library' }] },
  twitter: { card: 'summary_large_image', title, description, images: [shareImage] },
};
