import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ views: 0 }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const kv = (locals as any).runtime.env.VIEW_COUNTS;
    const views = await kv.get(slug);
    return new Response(JSON.stringify({ views: parseInt(views ?? '0', 10) }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ views: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ params, locals }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ views: 0 }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const kv = (locals as any).runtime.env.VIEW_COUNTS;
    const current = parseInt((await kv.get(slug)) ?? '0', 10);
    const next = current + 1;
    await kv.put(slug, next.toString());
    return new Response(JSON.stringify({ views: next }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ views: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
