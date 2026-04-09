import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  try {
    const { env: cfEnv } = await import("cloudflare:workers" as any);
    const cfKeys = Object.keys(cfEnv || {});
    const hasButtondown = !!(cfEnv as any)["Buttondown-APIKey"];
    const hasButtondownUpper = !!(cfEnv as any).BUTTONDOWN_APIKEY;
    const hasViewCounts = !!(cfEnv as any).VIEW_COUNTS;

    return new Response(
      JSON.stringify({
        source: "cloudflare:workers",
        cfEnvKeys: cfKeys,
        cfEnvKeysCount: cfKeys.length,
        hasButtondown,
        hasButtondownUpper,
        hasViewCounts,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to import cloudflare:workers", detail: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
