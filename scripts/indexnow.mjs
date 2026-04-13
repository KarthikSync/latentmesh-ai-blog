// Post-build IndexNow submission — reads dist/sitemap-0.xml from the
// filesystem (not a network fetch), submits all URLs, and logs the result.
// Fail-safe: always exits 0 so a failed submission never breaks the deploy.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const KEY = "ebed9b6694a44d49b2f74f4e9c4fb077";
const HOST = "latentmesh.ai";
const API = "https://api.indexnow.org/indexnow";

async function main() {
  // 1. Read sitemap from dist/ (exists after astro build)
  const sitemapPath = join(process.cwd(), "dist", "sitemap-0.xml");
  let xml;
  try {
    xml = readFileSync(sitemapPath, "utf-8");
  } catch {
    console.log("[IndexNow] No sitemap found at dist/sitemap-0.xml — skipping.");
    return;
  }

  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  if (urls.length === 0) {
    console.log("[IndexNow] No URLs found in sitemap — skipping.");
    return;
  }

  // 2. Submit to IndexNow
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  };

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  const responseText = await res.text();
  const success = res.ok || res.status === 202;

  if (success) {
    console.log(`[IndexNow] ✓ Submitted ${urls.length} URLs (${res.status} ${res.statusText})`);
  } else {
    console.log(`[IndexNow] ✗ Failed: ${res.status} ${res.statusText} — ${responseText}`);
  }
}

main().catch((err) => {
  // Fail-safe: log the error but never exit non-zero
  console.log(`[IndexNow] ✗ Error: ${err.message ?? err}`);
});
