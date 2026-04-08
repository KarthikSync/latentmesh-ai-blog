import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as any).runtime;
  const env = runtime?.env;

  const keys = env ? Object.keys(env) : [];
  const hasButtondown = keys.filter((k) => k.toLowerCase().includes("button"));

  return new Response(
    JSON.stringify({
      envKeysCount: keys.length,
      allKeys: keys,
      buttondownKeys: hasButtondown,
      runtimeExists: !!runtime,
      envExists: !!env,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
