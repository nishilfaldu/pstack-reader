import guide from './guide-chapters.json';

// Curated chapter titles; any new upstream chapter falls back to its own heading.
const curated: Record<string, string> = {
  '01-setup': 'Set up pstack',
  '02-poteto-mode': 'Route work through /poteto-mode',
  '03-understand': 'Understand the code before changing it',
  '04-design': 'Design before you write code',
  '05-build-and-clean': 'Build the change and clean the diff',
  '06-verify-and-ship': 'Verify the result and open a PR',
  '07-overnight': 'Run work while you sleep',
  '08-principles': 'Steer with principle names',
  '09-make-it-yours': 'Make it yours',
  '10-recipes-and-pitfalls': 'Recipes and pitfalls',
};

export const chapters: readonly { slug: string; title: string }[] = [
  { slug: '', title: 'The pstack guide' },
  ...guide.map((c) => ({ slug: c.slug, title: curated[c.slug] ?? c.title })),
];
export const chapterHref = (slug: string) => slug ? `/docs/${slug}` : '/docs';
