import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals, request }) => {
  const runtime = (locals as any).runtime;
  const env = runtime?.env;
  const cf = runtime?.cf;
  const ctx = runtime?.ctx;

  // Check multiple possible locations for bindings
  const localsKeys = Object.keys(locals || {});
  const envKeys = env ? Object.keys(env) : [];
  const runtimeKeys = runtime ? Object.keys(runtime) : [];

  // Try to find the KV binding to confirm bindings work
  const hasViewCounts = !!env?.VIEW_COUNTS;
  const hasButtondown = !!env?.["Buttondown-APIKey"];
  const hasButtondownUnderscore = !!env?.Buttondown_APIKey;
  const hasButtondownUpper = !!env?.BUTTONDOWN_APIKEY;

  return new Response(
    JSON.stringify({
      localsKeys,
      runtimeKeys,
      envKeys: envKeys.slice(0, 20),
      envKeysCount: envKeys.length,
      hasViewCounts,
      hasButtondown,
      hasButtondownUnderscore,
      hasButtondownUpper,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
