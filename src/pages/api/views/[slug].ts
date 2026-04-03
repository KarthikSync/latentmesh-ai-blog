import type { APIRoute } from 'astro';

export const prerender = false;

function extractSource(referer: string | null, utmSource: string | null): string {
  if (utmSource) return utmSource.toLowerCase();
  if (!referer) return 'direct';

  try {
    const host = new URL(referer).hostname.replace('www.', '');
    const map: Record<string, string> = {
      't.co': 'twitter',
      'x.com': 'twitter',
      'twitter.com': 'twitter',
      'linkedin.com': 'linkedin',
      'lnkd.in': 'linkedin',
      'google.com': 'google',
      'google.co.in': 'google',
      'bing.com': 'bing',
      'facebook.com': 'facebook',
      'reddit.com': 'reddit',
      'news.ycombinator.com': 'hackernews',
      'github.com': 'github',
    };
    return map[host] ?? host;
  } catch {
    return 'unknown';
  }
}

export const GET: APIRoute = async ({ params, locals }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ views: 0, referrers: {} }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const kv = (locals as any).runtime.env.VIEW_COUNTS;
    const views = parseInt((await kv.get(slug)) ?? '0', 10);

    // Collect referrer data
    const referrerPrefix = `${slug}:ref:`;
    const list = await kv.list({ prefix: referrerPrefix });
    const referrers: Record<string, number> = {};
    for (const key of list.keys) {
      const source = key.name.replace(referrerPrefix, '');
      const count = parseInt((await kv.get(key.name)) ?? '0', 10);
      if (count > 0) referrers[source] = count;
    }

    return new Response(JSON.stringify({ views, referrers }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ views: 0, referrers: {} }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ params, locals, request }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ views: 0 }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const kv = (locals as any).runtime.env.VIEW_COUNTS;

    // Increment total view count
    const current = parseInt((await kv.get(slug)) ?? '0', 10);
    const next = current + 1;
    await kv.put(slug, next.toString());

    // Track referrer source from client-provided document.referrer
    const body: any = await request.json().catch(() => ({}));
    const referer = body.referrer || null;
    const utmSource = body.utmSource || null;
    const source = extractSource(referer, utmSource);

    const refKey = `${slug}:ref:${source}`;
    const refCount = parseInt((await kv.get(refKey)) ?? '0', 10);
    await kv.put(refKey, (refCount + 1).toString());

    return new Response(JSON.stringify({ views: next }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ views: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
