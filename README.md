# pstack reader

A reading site for the [pstack plugin](https://github.com/cursor/plugins/tree/main/pstack), built with Next.js and Fumadocs. The guide is the linear reading path. The reference library contains the source README, 23 playbooks, all 47 skill pages (including all 23 current `principle-*` skills), their nested references, two agent docs, and the Benny automation pack.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000. `npm run check:content` checks routes, source coverage, and sidebar entries. `npm run build` checks the production build.

## Refresh from upstream

The current content was copied from `cursor/plugins` commit `ecc249f1e306fc64ddf83c7bed16cacf7c2239db`. To refresh it, clone or update a sparse checkout of the official repository and run:

```bash
python3 scripts/sync-content.py /path/to/plugins/pstack
npm run build
python3 scripts/audit-source.py /path/to/plugins/pstack
```

The copied material retains its upstream license in `UPSTREAM-LICENSE`. The audit compares every published source page and guide image against the pinned upstream commit. The sync script copies source text, gives every document a Fumadocs route, groups pages by source directory, rewrites links between copied pages, and records upstream paths in `lib/upstream-paths.json`. The guide chapter order lives in `content/docs/meta.json` and `lib/chapters.ts`.

## Deployment

This repository is linked to the `pstack-docs` Vercel project. The canonical site is [pstack.nishilfaldu.site](https://pstack.nishilfaldu.site); [pstack-reader.vercel.app](https://pstack-reader.vercel.app) also serves the reader. The potato favicon, Apple touch icon, and social preview can be regenerated with `npm run generate:brand`.
