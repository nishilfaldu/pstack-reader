const names: Record<string, string> = {
  ai: 'AI', api: 'API', benny: 'Benny', claude: 'Claude', cli: 'CLI', codex: 'Codex',
  cursor: 'Cursor', css: 'CSS', fumadocs: 'Fumadocs', git: 'Git',
  github: 'GitHub', html: 'HTML', http: 'HTTP', json: 'JSON',
  javascript: 'JavaScript', mcp: 'MCP', mdx: 'MDX', next: 'Next',
  openai: 'OpenAI', pr: 'PR', pstack: 'pstack', react: 'React',
  sdk: 'SDK', sql: 'SQL', tdd: 'TDD', tsv: 'TSV', typescript: 'TypeScript',
  ui: 'UI', url: 'URL', vercel: 'Vercel', yaml: 'YAML',
};

export function sidebarTitle(title: string, url?: string): string {
  if (url === '/docs/about') return 'About pstack';
  let first = true;
  return title.replace(/[A-Za-z][A-Za-z0-9]*/g, (word) => {
    const lower = word.toLowerCase();
    const known = names[lower] ?? (lower.endsWith('s') && names[lower.slice(0, -1)] ? names[lower.slice(0, -1)] + 's' : undefined);
    const replacement = known ?? (first ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase());
    first = false;
    return replacement;
  }).replace(/\bClaude code\b/g, 'Claude Code');
}
