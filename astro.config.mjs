// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import preact from "@astrojs/preact";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import cloudflare from "@astrojs/cloudflare";

const SITE = "https://latentmesh.ai";

// Internal, server-rendered pages that should not be offered to crawlers.
const SITEMAP_EXCLUDE = ["/admin/", "/analytics/"];

// lastmod for posts: updatedDate if set, otherwise pubDate.
function postDates() {
	const dir = "src/content/blog";
	const dates = new Map();
	for (const file of readdirSync(dir)) {
		if (!/\.mdx?$/.test(file)) continue;
		const frontmatter = readFileSync(join(dir, file), "utf-8").split("---")[1] ?? "";
		const field = (/** @type {string} */ name) => frontmatter.match(new RegExp(`^${name}:\\s*["']?([^"'\\n]+)`, "m"))?.[1];
		const date = new Date(field("updatedDate") ?? field("pubDate") ?? "");
		if (!Number.isNaN(date.valueOf())) dates.set(`/blog/${file.replace(/\.mdx?$/, "")}/`, date);
	}
	return dates;
}

// lastmod for static pages: last commit touching the page source. Skipped in
// shallow clones, where every file would report the HEAD commit date.
/** @param {string} file */
function gitDate(file) {
	try {
		const shallow = execFileSync("git", ["rev-parse", "--is-shallow-repository"], { encoding: "utf-8" }).trim();
		if (shallow !== "false") return undefined;
		const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], { encoding: "utf-8" }).trim();
		return iso ? new Date(iso) : undefined;
	} catch {
		return undefined;
	}
}

/** @param {string} pathname */
function pageSource(pathname) {
	const base = pathname === "/" ? "src/pages/index" : `src/pages${pathname.replace(/\/$/, "")}`;
	return [`${base}.astro`, `${base}/index.astro`].find((f) => existsSync(f));
}

const blogDates = postDates();

// https://astro.build/config
export default defineConfig({
	site: SITE,
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => !SITEMAP_EXCLUDE.some((prefix) => new URL(page).pathname.startsWith(prefix)),
			serialize(item) {
				const { pathname } = new URL(item.url);
				const source = pageSource(pathname);
				const lastmod = blogDates.get(pathname) ?? (source && gitDate(source));
				if (lastmod) item.lastmod = lastmod.toISOString();
				return item;
			},
		}),
		preact(),
	],
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
	}),
});
