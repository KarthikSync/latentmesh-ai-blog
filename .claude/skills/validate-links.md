---
description: "Validate all links across the site — checks external URLs for broken links and internal paths for missing pages"
user_invocable: true
---

Scan the entire LatentMesh blog site for broken links. Do the following:

1. **Extract all links** from:
   - All markdown files in `src/content/blog/*.md` (markdown link syntax `[text](url)` and raw URLs)
   - All `.astro` files in `src/pages/` and `src/layouts/` (href attributes with URLs)

2. **Classify links** as:
   - **External**: URLs starting with `http://` or `https://`
   - **Internal**: Paths starting with `/blog/`, `/series/`, `/topics/`, `/about`, or `/`

3. **Validate external links**:
   - Test each unique external URL with an HTTP HEAD request (use curl with -I flag, timeout 10s)
   - If HEAD fails or returns 405, fall back to GET
   - Record the HTTP status code
   - Mark as broken if status is 4xx or 5xx (except 403 which some sites return for bot protection)

4. **Validate internal links**:
   - For `/blog/<slug>/` paths, check that `src/content/blog/<slug>.md` exists
   - For `/series/` check that `src/pages/series/index.astro` exists
   - For `/topics/<tag>/` check that at least one blog post uses that tag
   - For `/about` check that `src/pages/about.astro` exists

5. **Output a report** with:
   - Total links checked (external + internal)
   - Number of broken links found
   - For each broken link: the source file, link text, URL, and HTTP status or error
   - Group broken links by source file

Run all external URL checks in parallel (up to 5 at a time) to keep total runtime reasonable.
Do NOT fix any links — just report findings.
