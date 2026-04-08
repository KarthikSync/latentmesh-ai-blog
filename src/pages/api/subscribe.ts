import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    const body = await request.json();
    const email = body?.email_address;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email address required." }),
        { status: 400, headers }
      );
    }

    // Try multiple access patterns for Cloudflare env
    const runtime = (locals as any).runtime;
    const env = runtime?.env;
    const apiKey =
      env?.["Buttondown-APIKey"] ??
      env?.BUTTONDOWN_APIKEY ??
      env?.["Buttondown_APIKey"];

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Service unavailable.",
          debug: `env keys: ${env ? Object.keys(env).join(", ") : "no env"}`,
        }),
        { status: 500, headers }
      );
    }

    const res = await fetch("https://api.buttondown.email/v1/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${apiKey}`,
      },
      body: JSON.stringify({ email_address: email }),
    });

    const data = await res.json();

    if (res.status === 201) {
      return new Response(
        JSON.stringify({ status: "subscribed" }),
        { status: 201, headers }
      );
    }

    if (res.status === 400 && JSON.stringify(data).includes("already")) {
      return new Response(
        JSON.stringify({ status: "already_subscribed" }),
        { status: 200, headers }
      );
    }

    return new Response(
      JSON.stringify({ error: "Subscription failed.", detail: data }),
      { status: res.status, headers }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Something went wrong.", detail: String(err) }),
      { status: 500, headers }
    );
  }
};
