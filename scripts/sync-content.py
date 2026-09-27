#!/usr/bin/env python3
"""Copy pstack Markdown into the Fumadocs library and retain source links."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path, PurePosixPath

SOURCE = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path('/tmp/pstack-upstream/pstack')
TARGET = Path(__file__).resolve().parents[1] / 'content/docs'
MAP_FILE = Path(__file__).resolve().parents[1] / 'lib/upstream-paths.json'
GUIDE = [
    '01-setup', '02-poteto-mode', '03-understand', '04-design',
    '05-build-and-clean', '06-verify-and-ship', '07-overnight',
    '08-principles', '09-make-it-yours', '10-recipes-and-pitfalls',
]


def destination(src: PurePosixPath) -> PurePosixPath:
    parts = src.parts
    if src == PurePosixPath('README.md'):
        return PurePosixPath('about.mdx')
    if src == PurePosixPath('docs/guide/README.md'):
        return PurePosixPath('index.mdx')
    if parts[:2] == ('docs', 'guide'):
        return PurePosixPath(src.stem + '.mdx')
    if parts[:3] == ('skills', 'poteto-mode', 'playbooks'):
        return PurePosixPath('playbooks') / (src.stem + '.mdx')
    if parts[0] == 'skills':
        skill = parts[1]
        if skill.startswith('principle-'):
            base = PurePosixPath('skills/principles') / skill.removeprefix('principle-')
            if src.name == 'SKILL.md':
                return base.with_suffix('.mdx')
            return base / PurePosixPath(*parts[2:]).with_suffix('.mdx')
        base = PurePosixPath('skills') / skill
        if src.name == 'SKILL.md':
            return base / 'index.mdx'
        return base / PurePosixPath(*parts[2:]).with_suffix('.mdx')
    if parts[0] == 'agents':
        return PurePosixPath('agents') / (src.stem.lower() + '.mdx')
    if parts[:2] == ('automations', 'benny'):
        if src.name == 'README.md':
            return PurePosixPath('automations/benny/index.mdx')
        if src.name == 'FOR_AGENTS.md':
            return PurePosixPath('automations/benny/for-agents.mdx')
        if len(parts) > 3 and parts[2] == 'skills' and src.name == 'SKILL.md':
            return PurePosixPath('automations/benny/skills') / parts[3] / 'index.mdx'
        return PurePosixPath('automations/benny') / PurePosixPath(*parts[2:]).with_suffix('.mdx')
    raise ValueError(src)


def page_title(path: PurePosixPath, body: str) -> str:
    heading = re.match(r'^#{1,6} (.+)$', body, re.M)
    if heading:
        return re.sub(r'[`*]', '', heading.group(1)).strip()
    words = path.parent.name if path.name == 'SKILL.md' else path.stem
    words = words.removeprefix('principle-').replace('-', ' ').replace('_', ' ').replace('.', ' ')
    acronyms = {'pr': 'PR', 'api': 'API', 'ui': 'UI', 'tdd': 'TDD', 'mcp': 'MCP', 'cli': 'CLI', 'json': 'JSON', 'yaml': 'YAML'}
    return ' '.join(acronyms.get(word.lower(), word.capitalize() if i == 0 else word.lower()) for i, word in enumerate(words.split()))


def split_frontmatter(content: str) -> str:
    if content.startswith('---\n'):
        end = content.find('\n---\n', 4)
        if end >= 0:
            return content[end + 5:].lstrip('\n')
    return content


def source_link(src: PurePosixPath) -> str:
    return 'https://github.com/cursor/plugins/blob/main/pstack/' + str(src)


def rewrite_links(body: str, current: PurePosixPath, destinations: dict[PurePosixPath, PurePosixPath]) -> str:
    def replace(match: re.Match[str]) -> str:
        url = match.group(1)
        if url.startswith(('https://', 'http://', 'mailto:', '#', 'data:')):
            return match.group(0)
        path, sep, fragment = url.partition('#')
        if not path:
            return match.group(0)
        resolved = PurePosixPath(__import__('posixpath').normpath(str(current.parent / path)))
        if resolved.parts[:3] == ('docs', 'guide', 'images'):
            return '](/images/' + resolved.name + (sep + fragment if sep else '') + ')'
        if resolved in destinations:
            route = str(destinations[resolved].with_suffix(''))
            if route.endswith('/index'):
                route = route[:-6]
            if route == 'index':
                route = ''
            return '](/docs' + ('/' + route if route else '') + (sep + fragment if sep else '') + ')'
        location = 'tree' if (SOURCE / resolved).is_dir() else 'blob'
        return '](https://github.com/cursor/plugins/' + location + '/main/pstack/' + str(resolved) + (sep + fragment if sep else '') + ')'
    return re.sub(r'\]\(([^)]+)\)', replace, body)


def safe_mdx(body: str) -> str:
    # MDX treats angle-bracket placeholders and braces as JSX; preserve prose verbatim.
    chunks = re.split(r'(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`)', body)
    for i in range(0, len(chunks), 2):
        chunks[i] = chunks[i].replace('<', '&lt;')
        chunks[i] = chunks[i].replace('{', '&#123;').replace('}', '&#125;')
    return ''.join(chunks)


def write_meta(folder: PurePosixPath, title: str, pages: list[str], default_open: bool = False) -> None:
    dest = TARGET / folder
    dest.mkdir(parents=True, exist_ok=True)
    (dest / 'meta.json').write_text(json.dumps({'title': title, 'defaultOpen': default_open, 'pages': pages}, indent=2) + '\n')


def write_index(folder: PurePosixPath, title: str, introduction: str, entries: list[tuple[str, PurePosixPath]]) -> None:
    dest = TARGET / folder / 'index.mdx'
    dest.parent.mkdir(parents=True, exist_ok=True)
    links = '\n'.join('- [' + label + '](/docs/' + str(route).removesuffix('.mdx').removesuffix('/index') + ')' for label, route in entries)
    dest.write_text('---\ntitle: ' + json.dumps(title) + '\n---\n\n' + links + '\n')


def main() -> None:
    files = sorted(p for p in SOURCE.rglob('*') if p.is_file() and (p.suffix == '.md' or p.as_posix().endswith('/references/decision-log-template.tsv') or p.as_posix().endswith('/templates/configuration.example.yaml')))
    destinations = {PurePosixPath(p.relative_to(SOURCE).as_posix()): destination(PurePosixPath(p.relative_to(SOURCE).as_posix())) for p in files}
    titles: dict[PurePosixPath, str] = {}
    upstream: dict[str, str] = {}
    for source, target in destinations.items():
        raw = (SOURCE / source).read_text()
        body = split_frontmatter(raw) if source.suffix == '.md' else '```' + source.suffix.lstrip('.') + '\n' + raw.rstrip() + '\n```\n'
        title = page_title(source, body) if source.suffix == '.md' else source.name.replace('.', ' ').replace('-', ' ').title()
        titles[source] = title
        body = re.sub(r'^# [^\n]+\n\n?', '', body, count=1)
        body = rewrite_links(body, source, destinations)
        body = safe_mdx(body)
        body = re.sub(r'[ \t]+$', '', body, flags=re.M)
        doc = '---\ntitle: ' + json.dumps(title) + '\n---\n\n' + body.rstrip() + '\n'
        output = TARGET / target
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(doc)
        route = str(target.with_suffix(''))
        route = route.removesuffix('/index')
        if route == 'index': route = ''
        upstream[route] = str(source)

    # A readable tree follows the upstream directories while exposing playbooks directly.
    write_meta(PurePosixPath('.'), 'pstack', ['index', '---Guide---', *GUIDE, '---Reference library---', 'playbooks', 'skills', 'agents', 'automations', 'about'], True)
    playbooks = sorted((p for p in destinations if p.parts[:3] == ('skills', 'poteto-mode', 'playbooks')), key=lambda p: p.stem)
    write_index(PurePosixPath('playbooks'), 'Playbooks', 'The 23 operating playbooks from `skills/poteto-mode/playbooks`. Choose a workflow, then read its steps and finish condition.', [(titles[p], destinations[p]) for p in playbooks])
    write_meta(PurePosixPath('playbooks'), 'Playbooks', ['index', *[p.stem for p in playbooks]])
    skill_pages = sorted((p for p in destinations if p.parts[0] == 'skills' and p.name == 'SKILL.md' and not p.parts[1].startswith('principle-')), key=lambda p: p.parts[1])
    principle_pages = sorted((p for p in destinations if p.parts[0] == 'skills' and p.name == 'SKILL.md' and p.parts[1].startswith('principle-')), key=lambda p: p.parts[1])
    write_index(PurePosixPath('skills'), 'Skills', 'Each skill below is copied from its own source directory. Open a skill for its instructions; nested reference pages stay with that skill.', [(titles[p], destinations[p]) for p in skill_pages] + [('Principles', PurePosixPath('skills/principles/index.mdx'))])
    write_meta(PurePosixPath('skills'), 'Skills', ['index', 'principles', *[p.parts[1] for p in skill_pages]])
    write_index(PurePosixPath('skills/principles'), 'Principles', 'The 23 `principle-*` skills collected in one reading shelf.', [(titles[p], destinations[p]) for p in principle_pages])
    write_meta(PurePosixPath('skills/principles'), 'Principles', ['index', *[p.parts[1].removeprefix('principle-') for p in principle_pages]])
    for p in skill_pages:
        skill = p.parts[1]
        refs = sorted((q for q in destinations if q.parts[:2] == ('skills', skill) and 'references' in q.parts), key=lambda q: str(q))
        if refs:
            write_meta(PurePosixPath('skills') / skill, titles[p], ['index', 'references'])
            direct = [q for q in refs if len(q.parts) == 4]
            nested = sorted(set(q.parts[3] for q in refs if len(q.parts) > 4))
            write_meta(PurePosixPath('skills') / skill / 'references', 'References', [*[destinations[q].stem for q in direct], *nested])
            for part in nested:
                children = [q for q in refs if len(q.parts) > 4 and q.parts[3] == part]
                write_meta(PurePosixPath('skills') / skill / 'references' / part, part.title(), [destinations[q].stem for q in children])
    agents = sorted((p for p in destinations if p.parts[0] == 'agents'), key=lambda p: p.stem)
    write_index(PurePosixPath('agents'), 'Agents', 'Agent instructions from the pstack plugin.', [(titles[p], destinations[p]) for p in agents])
    write_meta(PurePosixPath('agents'), 'Agents', ['index', *[p.stem for p in agents]])
    write_index(PurePosixPath('automations'), 'Automations', 'The automation pack included with pstack.', [('Benny', PurePosixPath('automations/benny/index.mdx'))])
    write_meta(PurePosixPath('automations'), 'Automations', ['index', 'benny'])
    write_meta(PurePosixPath('automations/benny'), 'Benny', ['index', 'for-agents', 'skills', 'templates'])
    benny_skills = sorted((p for p in destinations if p.parts[:3] == ('automations', 'benny', 'skills') and p.name == 'SKILL.md'), key=lambda p: p.parts[3])
    write_index(PurePosixPath('automations/benny/skills'), 'Benny skills', 'The skills used by the Benny automation pack.', [(titles[p], destinations[p]) for p in benny_skills])
    write_meta(PurePosixPath('automations/benny/skills'), 'Benny skills', ['index', *[p.parts[3] for p in benny_skills]])
    for p in benny_skills:
        skill = p.parts[3]
        refs = sorted(q for q in destinations if q.parts[:5] == ('automations', 'benny', 'skills', skill, 'references'))
        if refs:
            write_meta(PurePosixPath('automations/benny/skills') / skill, titles[p], ['index', 'references'])
            write_meta(PurePosixPath('automations/benny/skills') / skill / 'references', 'References', [destinations[q].stem for q in refs])
    templates = sorted((p for p in destinations if p.parts[:3] == ('automations', 'benny', 'templates')), key=lambda p: p.stem)
    write_index(PurePosixPath('automations/benny/templates'), 'Benny templates', 'Source templates for configuring and running the automations.', [(titles[p], destinations[p]) for p in templates])
    write_meta(PurePosixPath('automations/benny/templates'), 'Templates', ['index', *[destinations[p].stem for p in templates]])
    MAP_FILE.write_text(json.dumps(upstream, indent=2, sort_keys=True) + '\n')
    print(f'Copied {len(files)} source documents and generated navigation indexes.')


if __name__ == '__main__':
    main()
