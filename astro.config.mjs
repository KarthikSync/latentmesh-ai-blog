// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import preact from "@astrojs/preact";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

import cloudflare from "@astrojs/cloudflare";

const SITE = "https://latentmesh.ai";

// Only pages that are part of the current site. Other routes still resolve
// but are not offered to crawlers.
const SITEMAP_PAGES = ["/", "/about/"];

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

// https://astro.build/config
export default defineConfig({
	site: SITE,
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => SITEMAP_PAGES.includes(new URL(page).pathname),
			serialize(item) {
				const { pathname } = new URL(item.url);
				const source = pageSource(pathname);
				const lastmod = source && gitDate(source);
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
