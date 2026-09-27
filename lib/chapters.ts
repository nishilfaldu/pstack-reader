export const chapters = [
  { slug: '', title: 'The pstack guide' },
  { slug: '01-setup', title: 'Set up pstack' },
  { slug: '02-poteto-mode', title: 'Route work through /poteto-mode' },
  { slug: '03-understand', title: 'Understand the code' },
  { slug: '04-design', title: 'Design the change' },
  { slug: '05-build-and-clean', title: 'Build and clean the change' },
  { slug: '06-verify-and-ship', title: 'Verify and ship' },
  { slug: '07-overnight', title: 'Run work while you sleep' },
  { slug: '08-principles', title: 'Steer with principle names' },
  { slug: '09-make-it-yours', title: 'Make it yours' },
  { slug: '10-recipes-and-pitfalls', title: 'Recipes and pitfalls' },
] as const;
export const chapterHref = (slug: string) => slug ? `/docs/${slug}` : '/docs';
