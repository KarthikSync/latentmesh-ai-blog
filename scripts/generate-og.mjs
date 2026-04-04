import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = join(process.cwd(), 'src/content/blog');
const OUTPUT_DIR = join(process.cwd(), 'public/og');
const FONT_PATH = join(process.cwd(), 'public/fonts/atkinson-bold.woff');

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const fontData = readFileSync(FONT_PATH);

// Read all blog posts
const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

for (const file of files) {
  const slug = file.replace(/\.(md|mdx)$/, '');
  const outputPath = join(OUTPUT_DIR, `${slug}.png`);

  // Skip if already generated
  if (existsSync(outputPath)) {
    console.log(`  Skipping ${slug} (already exists)`);
    continue;
  }

  const content = readFileSync(join(CONTENT_DIR, file), 'utf-8');
  const { data } = matter(content);
  const title = data.title || slug;

  console.log(`  Generating OG image for: ${title}`);

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          backgroundColor: '#0f172a',
          fontFamily: 'Atkinson',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#60a5fa',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    },
                    children: 'latentmesh.ai',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '48px',
                      fontWeight: 700,
                      color: '#f1f5f9',
                      lineHeight: 1.2,
                      maxWidth: '900px',
                    },
                    children: title,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'flex-end',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '20px',
                      color: '#94a3b8',
                    },
                    children: 'Karthik Mahalingam',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Atkinson',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    },
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });
  const png = resvg.render().asPng();
  writeFileSync(outputPath, png);
  console.log(`  ✓ ${outputPath}`);
}

console.log('OG image generation complete.');
