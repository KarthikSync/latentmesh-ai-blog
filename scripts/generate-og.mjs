import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = join(process.cwd(), 'src/content/blog');
const OUTPUT_DIR = join(process.cwd(), 'public/og');
const FONT_PATH = join(process.cwd(), 'public/fonts/atkinson-bold.woff');

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const fontData = readFileSync(FONT_PATH);
const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

for (const file of files) {
  const slug = file.replace(/\.(md|mdx)$/, '');
  const outputPath = join(OUTPUT_DIR, `${slug}.png`);

  if (existsSync(outputPath)) {
    console.log(`  Skip ${slug}`);
    continue;
  }

  const content = readFileSync(join(CONTENT_DIR, file), 'utf-8');
  const { data } = matter(content);
  const title = data.title || slug;

  console.log(`  Generating: ${slug}`);

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
          padding: '60px 80px',
          backgroundColor: '#0f172a',
          fontFamily: 'Atkinson',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '20px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { fontSize: '18px', fontWeight: 700, color: '#60a5fa', letterSpacing: '0.06em', textTransform: 'uppercase' },
                    children: 'latentmesh.ai',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { fontSize: '52px', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.15, maxWidth: '950px' },
                    children: title,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: '20px', color: '#94a3b8' },
              children: 'Karthik Mahalingam',
            },
          },
        ],
      },
    },
    { width: 1200, height: 630, fonts: [{ name: 'Atkinson', data: fontData, weight: 700, style: 'normal' }] },
  );

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  writeFileSync(outputPath, png);
  console.log(`  ✓ ${slug}.png`);
}

console.log('Done.');
