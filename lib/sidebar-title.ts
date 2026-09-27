const names: Record<string, string> = {
  ai: 'AI', api: 'API', benny: 'Benny', cli: 'CLI', codex: 'Codex',
  cursor: 'Cursor', css: 'CSS', fumadocs: 'Fumadocs', git: 'Git',
  github: 'GitHub', html: 'HTML', http: 'HTTP', json: 'JSON',
  javascript: 'JavaScript', mcp: 'MCP', mdx: 'MDX', next: 'Next',
  openai: 'OpenAI', pr: 'PR', pstack: 'pstack', react: 'React',
  sdk: 'SDK', sql: 'SQL', tdd: 'TDD', typescript: 'TypeScript',
  ui: 'UI', url: 'URL', vercel: 'Vercel', yaml: 'YAML',
};

export function sidebarTitle(title: string, url?: string): string {
  if (url === '/docs/about') return 'About pstack';
  let first = true;
  return title.replace(/[A-Za-z][A-Za-z0-9]*/g, (word) => {
    const known = names[word.toLowerCase()];
    const replacement = known ?? (first ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase());
    first = false;
    return replacement;
  });
}
