#!/usr/bin/env python3
"""Check generated docs routes, local links, and sidebar entries."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1] / 'content/docs'
routes = {p.relative_to(root).with_suffix('').as_posix().removesuffix('/index') for p in root.rglob('*.mdx')}
routes.discard('index')
routes.add('')
errors = []

for page in root.rglob('*.mdx'):
    for url in re.findall(r'\]\((/docs[^)]+)\)', page.read_text()):
        route = url.split('#', 1)[0].removeprefix('/docs').strip('/')
        if route not in routes:
            errors.append(f'{page.relative_to(root)}: missing link {url}')

for meta in root.rglob('meta.json'):
    folder = meta.parent
    for item in json.loads(meta.read_text()).get('pages', []):
        if item.startswith('---') or item == '...':
            continue
        target = folder / item
        if not (target.is_dir() or (folder / (item + '.mdx')).is_file()):
            errors.append(f'{meta.relative_to(root)}: missing sidebar item {item}')

upstream = json.loads((root.parent.parent / 'lib/upstream-paths.json').read_text())
for route, path in upstream.items():
    if route not in routes:
        errors.append(f'missing copied source {path}: /docs/{route}')

if errors:
    raise SystemExit('\n'.join(errors))
print(f'Checked {len(routes)} pages, {len(upstream)} upstream files, local links, and sidebar entries.')
