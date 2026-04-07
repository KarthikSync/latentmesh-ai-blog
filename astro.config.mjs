// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import preact from "@astrojs/preact";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
	site: "https://latentmesh.ai",
	integrations: [mdx(), sitemap(), preact()],
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
	}),
});
