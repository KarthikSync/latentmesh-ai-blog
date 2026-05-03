import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const ROOT = resolve(import.meta.dirname, "..");
const CONTENT_DIR = join(ROOT, "src", "content", "blog");
const OUT_DIR = join(ROOT, "public", "og");
const FONT_DIR = join(ROOT, "public", "fonts");

const WIDTH = 1200;
const HEIGHT = 630;

const fontRegular = readFileSync(join(FONT_DIR, "atkinson-regular.woff"));
const fontBold = readFileSync(join(FONT_DIR, "atkinson-bold.woff"));

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^(\w+):\s*"(.+)"$/);
    if (m) fm[m[1]] = m[2];
    const m2 = line.match(/^(\w+):\s*'(.+)'$/);
    if (m2) fm[m2[1]] = m2[2];
  }
  return fm;
}

function truncate(text, maxLen) {
  if (!text || text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + "…";
}

function buildMarkup(title, description) {
  const displayTitle = truncate(title, 90);
  const displayDesc = truncate(description, 140);
  const titleSize = displayTitle.length > 60 ? 40 : displayTitle.length > 40 ? 48 : 54;

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffff",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              width: "6px",
              height: "100%",
              backgroundColor: "#2563eb",
              flexShrink: 0,
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "60px 80px 60px 70px",
              flex: 1,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#2563eb",
                    letterSpacing: "0.1em",
                    marginBottom: 32,
                  },
                  children: "LATENTMESH.AI",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: titleSize,
                    fontWeight: 700,
                    color: "#0f172a",
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                    marginBottom: 24,
                  },
                  children: displayTitle,
                },
              },
              ...(displayDesc
                ? [
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: 20,
                          color: "#475569",
                          lineHeight: 1.5,
                          marginBottom: 32,
                        },
                        children: displayDesc,
                      },
                    },
                  ]
                : []),
              {
                type: "div",
                props: {
                  style: {
                    width: 180,
                    height: 4,
                    backgroundColor: "#2563eb",
                    borderRadius: 2,
                    marginBottom: 32,
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 18,
                    color: "#64748b",
                  },
                  children: "Karthik Mahalingam",
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function generateImage(title, description, outputPath) {
  const markup = buildMarkup(title, description);

  const svg = await satori(markup, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: "Atkinson", data: fontRegular, weight: 400, style: "normal" },
      { name: "Atkinson", data: fontBold, weight: 700, style: "normal" },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  });
  const png = resvg.render().asPng();
  writeFileSync(outputPath, png);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
  let generated = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = file.replace(/\.(md|mdx)$/, "");
    const outPath = join(OUT_DIR, `${slug}.png`);

    if (existsSync(outPath)) {
      skipped++;
      continue;
    }

    const content = readFileSync(join(CONTENT_DIR, file), "utf-8");
    const fm = extractFrontmatter(content);
    if (!fm || !fm.title) {
      console.log(`  skip ${file} (no frontmatter)`);
      continue;
    }

    await generateImage(fm.title, fm.description || "", outPath);
    generated++;
    console.log(`  ✓ ${slug}.png`);
  }

  console.log(`\nOG images: ${generated} generated, ${skipped} already exist, ${files.length} total posts`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
