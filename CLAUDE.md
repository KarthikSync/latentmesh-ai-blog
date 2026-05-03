# LatentMesh.ai Blog

Astro blog deployed on Cloudflare Workers. Content lives in `src/content/blog/` as markdown files.

## Custom Skills

- `/validate-links` — Scans all blog posts and pages for broken external URLs and missing internal links. Run this after publishing new content or updating references.

## Project Structure

- `src/content/blog/` — Blog post markdown files
- `src/pages/` — Astro page components (index, blog, series, about, topics)
- `src/layouts/BlogPost.astro` — Article template with series navigation
- `src/components/` — Shared components (Header, Footer, etc.)
- `public/images/` — Static images referenced in blog posts

## Series

The site has two essay series, both defined in `src/layouts/BlogPost.astro`:

- **Reliable Agent Systems** (10 essays + companions) — `seriesEssays` array. Landing page at `src/pages/series/reliable-agent-systems/index.astro`. Extended reading guide at `src/pages/reading-list/index.astro`.
- **Evaluating Agent Fleets** (in progress, 8 planned) — `fleetSeriesEssays` array. Landing page at `src/pages/series/evaluating-agent-fleets/index.astro`.

The series index at `src/pages/series/index.astro` shows both series as cards. The homepage "Featured series" section links to both.

## Publishing a New Blog Post

### Frontmatter format

Every post needs this frontmatter in `src/content/blog/<slug>.md`:

```yaml
---
title: "Post Title"
description: "One-sentence SEO description."
pubDate: "May 03 2026 09:00"
tags: ["evals", "agents", "reliability"]
summary: "Multi-sentence summary for the SummaryCard component."
summaryProblem: "One sentence naming the problem."
summaryCoreIdea: "One sentence with the core idea."
summaryTakeaway: "One sentence with the takeaway."
---
```

Tags drive topic page routing (`/topics/<tag>/`) and the category pill on essay cards. Valid tags: `reliability`, `evals`, `compliance`, `safety`, `evidence`, `practical`, `agents`.

### Internal links

Use relative paths for all internal links: `/blog/<slug>/`, `/series/reliable-agent-systems/`, etc. Never use absolute `https://latentmesh.ai/...` URLs in post content.

### Adding a post to a series

When adding a new essay to either series:

1. **Create the markdown file** at `src/content/blog/<slug>.md` with full frontmatter.
2. **Add to the series array** in `src/layouts/BlogPost.astro`:
   - Reliable Agent Systems → append to `seriesEssays`
   - Evaluating Agent Fleets → append to `fleetSeriesEssays`
   - This gives the post series nav (header badge, reading order, prev/next links).
3. **Update the series landing page**:
   - Reliable Agent Systems → `src/pages/series/reliable-agent-systems/index.astro`
   - Evaluating Agent Fleets → `src/pages/series/evaluating-agent-fleets/index.astro`
   - Add a new `<li>` with essay number, title, and description.
4. **Build and test**: `npm run check` (astro build + tsc + wrangler dry-run) and `npx vitest run`.
5. **Verify on dev server**: `npm run dev` — check the post page renders, series nav shows correct "Essay N of M", and prev/next links work on both the new post and the previous post.

### Adding a standalone post (not in a series)

1. Create the markdown file with frontmatter. Omit or use any valid tags.
2. The post appears automatically in `/blog/` and `/topics/<tag>/` pages.
3. No series array or landing page updates needed.

### Pre-push checklist

- [ ] `npm run check` passes clean
- [ ] `npx vitest run` — all tests pass
- [ ] Dev server: post renders, series nav correct, no layout regressions
- [ ] External links: click-test from a browser (sandbox cannot verify outbound URLs)
