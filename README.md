# pstack reader

A reading site for the [pstack plugin](https://github.com/cursor/plugins/tree/main/pstack), built with Next.js and Fumadocs. The guide is the linear reading path. The reference library is generated from every Markdown file in upstream `pstack/`: the source README, playbooks, skills (with the `principle-*` shelf), their references, agent docs, the Benny automation pack, and any new upstream section.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000. `npm run check:content` checks routes, source coverage, and sidebar entries. `npm run build` checks the production build.

## Refresh from upstream

Everything under `content/docs`, `public/images`, `lib/upstream-paths.json` and `lib/guide-chapters.json` is generated; never edit it by hand. `UPSTREAM_SHA` records the synced `cursor/plugins` commit.

```bash
bash scripts/sync.sh   # sparse-clones cursor/plugins, regenerates content, runs check-content and audit-source
npm run build
```

`.github/workflows/sync-upstream.yml` does this every 6 hours (and on demand), builds, and pushes to `main` only when the content changed; Vercel deploys `main`. Curated choices live in code: section order in `scripts/sync-content.py` (new upstream sections are appended with a warning) and chapter titles in `lib/chapters.ts` (new chapters use their own heading).

The copied material retains its upstream license in `UPSTREAM-LICENSE`.

## Deployment

This repository is linked to the `pstack-docs` Vercel project. The canonical site is [pstack.nishilfaldu.site](https://pstack.nishilfaldu.site); [pstack-reader.vercel.app](https://pstack-reader.vercel.app) also serves the reader. The potato favicon, Apple touch icon, and social preview can be regenerated with `npm run generate:brand`.
