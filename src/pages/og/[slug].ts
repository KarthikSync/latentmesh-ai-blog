import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';

export const prerender = false;

let wasmInitialized = false;

export const GET: APIRoute = async ({ params, request }) => {
  const slug = params.slug?.replace(/\.png$/, '');
  if (!slug) {
    return new Response('Not found', { status: 404 });
  }

  const posts = await getCollection('blog');
  const post = posts.find((p) => p.id === slug);
  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  try {
    // Load font
    const fontUrl = new URL('/fonts/atkinson-bold.woff', request.url);
    const fontResponse = await fetch(fontUrl);
    const fontData = await fontResponse.arrayBuffer();

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
                        textTransform: 'uppercase' as const,
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
                      children: post.data.title,
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
                  justifyContent: 'space-between',
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
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '16px',
                        color: '#64748b',
                      },
                      children: post.data.description ?? '',
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

    // Initialize WASM only once (loaded from deployed assets, not CDN)
    if (!wasmInitialized) {
      try {
        const wasmUrl = new URL('/resvg.wasm', request.url);
        await initWasm(fetch(wasmUrl));
        wasmInitialized = true;
      } catch {
        // May already be initialized in this isolate
        wasmInitialized = true;
      }
    }

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
    });
    const png = resvg.render().asPng();

    return new Response(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e) {
    console.error('OG image generation failed:', e);
    return new Response('Error generating image', { status: 500 });
  }
};
