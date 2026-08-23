import { verifyFollowProof } from "@/features/follow-verification/services/verification.service";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const form = await request.formData();
    const apiKey = process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY || process.env["ai-api-key"];
    const origin =
      request.headers.get("origin") ||
      (request.headers.get("host") ? `https://${request.headers.get("host")}` : null) ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://timeline-visualer.vercel.app");

    const result = await verifyFollowProof({
      image: form.get("screenshot"),
      apiKey,
      origin,
    });

    return Response.json(result, {
      status: result.reason?.includes("smaller than")
        ? 400
        : result.reason?.includes("missing") || result.reason?.includes("not configured")
        ? 503
        : 200,
    });
  } catch {
    return Response.json(
      {
        valid: false,
        reason: "We couldn't verify this screenshot. Upload a sharper screenshot showing the account and Following.",
      },
      { status: 502 }
    );
  }
}
