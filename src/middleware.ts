import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ request, locals, url }, next) => {
  if (url.pathname.startsWith('/analytics')) {
    const expectedPassword = (locals as any).runtime?.env?.ANALYTICS_PASSWORD;
    if (!expectedPassword) return next(); // no password set = open access during dev

    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Basic ')) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Analytics"' },
      });
    }

    const decoded = atob(auth.slice(6));
    const [, password] = decoded.split(':');
    if (password !== expectedPassword) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Analytics"' },
      });
    }
  }
  return next();
});
