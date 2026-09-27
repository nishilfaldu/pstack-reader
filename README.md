# pstack reader

A chapter-first reading experience for the [pstack guide](https://github.com/cursor/plugins/tree/main/pstack/docs/guide), built with Next.js and Fumadocs.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000. `npm run build` verifies the production build.

The guide pages in `content/docs` are copied from cursor/plugins at commit `ecc249f1e306fc64ddf83c7bed16cacf7c2239db`. Links to skills and playbooks point to their canonical upstream files. Chapter order is defined in `content/docs/meta.json` and `lib/chapters.ts`.

## Deployment

Import this repository into Vercel as a Next.js project. The canonical site URL is `https://pstack-reader.vercel.app`.
