import Link from 'next/link';
import { libraryEntries } from '@/lib/library';

const shelves = [
  { url: '/docs/playbooks', title: 'Playbooks', blurb: 'Workflows that /poteto-mode routes a task into, from bug fix to shipping.' },
  { url: '/docs/skills', title: 'Skills', blurb: 'Skills you call by name, from /architect to /why.', exclude: '/docs/skills/principles' },
  { url: '/docs/skill-flows', title: 'Skill flows', blurb: 'Each skill drawn as a diagram, with the principles and playbooks it draws on.', uncounted: true },
  { url: '/docs/skills/principles', title: 'Principles', blurb: 'Principle names that redirect an agent mid-task.' },
  { url: '/docs/agents', title: 'Agents', blurb: 'Subagent definitions the skills delegate to.' },
  { url: '/docs/automations', title: 'Automations', blurb: 'The Benny pack: triage and reproduce issue reports from Slack.', uncounted: true },
];

export function LibraryShelves() {
  return <section className="reference-shelves" aria-labelledby="reference-library">
    <h2 id="reference-library">Reference library</h2>
    <div>
      {shelves.map((shelf) => {
        const count = libraryEntries(shelf.url).filter((entry) => entry.url !== shelf.exclude).length;
        return <Link key={shelf.url} href={shelf.url}>
          <strong>{shelf.title}{!shelf.uncounted && <span className="shelf-count">{count}</span>}</strong>
          <span>{shelf.blurb}</span>
        </Link>;
      })}
    </div>
  </section>;
}
