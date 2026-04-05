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

The site has a 10-essay series "Reliable Agent Systems" plus standalone companion articles tagged `practical`. The series navigation is defined in `src/layouts/BlogPost.astro` (seriesEssays array) and the series landing page at `src/pages/series/index.astro`.

When adding a new series essay, update:
1. The `seriesEssays` array in `BlogPost.astro`
2. The series page at `src/pages/series/index.astro`
3. The homepage series count in `src/pages/index.astro`
4. The previous essay's "next" link
