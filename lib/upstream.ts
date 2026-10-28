import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import paths from './upstream-paths.json';

const sha = readFileSync(join(process.cwd(), 'UPSTREAM_SHA'), 'utf8').trim();
const upstreamPaths: Record<string, string> = paths;

export function upstreamSource(route: string) {
  const path = upstreamPaths[route];
  return path ? { path: `pstack/${path}`, url: `https://github.com/cursor/plugins/blob/${sha}/pstack/${path}` } : undefined;
}
