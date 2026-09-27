#!/usr/bin/env python3
"""Compare every published source page with the pinned pstack checkout."""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

SOURCE = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path('/tmp/pstack-upstream/pstack')
ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'content/docs'
MAPPING = json.loads((ROOT / 'lib/upstream-paths.json').read_text())
EXPECTED_COMMIT = 'ecc249f1e306fc64ddf83c7bed16cacf7c2239db'


def source_body(text: str) -> str:
    if text.startswith('---\n'):
        end = text.find('\n---\n', 4)
        if end >= 0:
            return text[end + 5:].lstrip('\n')
    return text


def normalize(text: str) -> str:
    text = re.sub(r'\]\([^)]+\)', '](LINK)', text)
    return '\n'.join(line.rstrip() for line in text.strip().splitlines())


def target_for(route: str) -> Path:
    return DOCS / ((route + '/index.mdx') if route and (DOCS / route).is_dir() else ((route or 'index') + '.mdx'))


def audit(route: str, source_path: str) -> list[str]:
    errors = []
    src = SOURCE / source_path
    dst = target_for(route)
    if not src.is_file() or not dst.is_file():
        return [f'{route}: source or page missing']
    published = dst.read_text()
    if not published.startswith('---\n'):
        return [f'{route}: missing page frontmatter']
    end = published.find('\n---\n', 4)
    title_match = re.search(r'^title: (.+)$', published[4:end], re.M)
    title = json.loads(title_match.group(1)) if title_match else None
    actual = published[end + 5:].lstrip('\n')
    raw = src.read_text()
    if src.suffix == '.md':
        expected = source_body(raw)
        heading = re.match(r'^# (.+)$', expected, re.M)
        if heading:
            source_title = re.sub(r'[`*]', '', heading.group(1)).strip()
            if title != source_title:
                errors.append(f'{route}: displayed title {title!r} differs from source {source_title!r}')
            expected = re.sub(r'^# [^\n]+\n\n?', '', expected, count=1)
        actual = actual.replace('&lt;', '<').replace('&#123;', '{').replace('&#125;', '}')
    else:
        expected = '```' + src.suffix.lstrip('.') + '\n' + raw.rstrip() + '\n```\n'
    if normalize(actual) != normalize(expected):
        actual_lines = normalize(actual).splitlines()
        expected_lines = normalize(expected).splitlines()
        for i, (got, want) in enumerate(zip(actual_lines, expected_lines), 1):
            if got != want:
                errors.append(f'{route}: first body difference at line {i}: {got[:80]!r} != {want[:80]!r}')
                break
        else:
            errors.append(f'{route}: body line count {len(actual_lines)} != {len(expected_lines)}')
    return errors


def main() -> None:
    import subprocess
    commit = subprocess.check_output(['git', '-C', str(SOURCE), 'rev-parse', 'HEAD'], text=True).strip()
    if commit != EXPECTED_COMMIT:
        raise SystemExit(f'Upstream commit changed to {commit}; review and update the pinned audit commit.')
    errors = []
    for route, path in MAPPING.items():
        errors.extend(audit(route, path))
    for image in (SOURCE / 'docs/guide/images').glob('*'):
        target = ROOT / 'public/images' / image.name
        if not target.exists() or hashlib.sha256(image.read_bytes()).digest() != hashlib.sha256(target.read_bytes()).digest():
            errors.append(f'guide image differs: {image.name}')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'Audited {len(MAPPING)} source pages and 6 guide images against cursor/plugins {commit[:12]}.')


if __name__ == '__main__':
    main()
