import { verifyFollowProof } from "@/features/follow-verification/services/verification.service";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const form = await request.formData();
    const result = await verifyFollowProof({ image: form.get("screenshot"), apiKey: process.env.OPENROUTER_API_KEY || process.env["ai-api-key"], origin: request.headers.get("origin") });
    return Response.json(result, { status: result.reason?.includes("smaller than") ? 400 : result.reason?.includes("not configured") ? 503 : 200 });
  } catch {
    return Response.json({ valid: false, reason: "We couldn't verify this screenshot. Upload a sharper screenshot showing the account and Following." }, { status: 502 });
  }
}
