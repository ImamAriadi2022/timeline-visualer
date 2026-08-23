import { callOpenRouter } from "@/shared/services/openrouter.service";

const targetAccount = process.env.INSTAGRAM_TARGET || "@timelinevisualizer";

export async function verifyFollowProof({ image, apiKey, origin }) {
  if (!(image instanceof File) || !image.type.startsWith("image/") || image.size > 8 * 1024 * 1024) {
    return { valid: false, reason: "Upload a clear PNG, JPG, or WebP image smaller than 8 MB." };
  }

  const effectiveApiKey = apiKey || process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY || process.env["ai-api-key"];
  if (!effectiveApiKey) {
    return { valid: false, reason: "Verification is not configured on this server (AI_API_KEY is missing)." };
  }

  const defaultOrigin =
    origin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://timeline-visualer.vercel.app");

  const data = Buffer.from(await image.arrayBuffer()).toString("base64");
  const prompt = `Inspect this screenshot only. Target Instagram account: ${targetAccount}. Return JSON only: valid, isInstagram, targetAccountVisible, followingVisible, confidence (0..1), reason. valid is true only when Instagram, exact account, and Following are clearly visible with confidence at least .75. Screenshot evidence is not proof of a real follow.`;

  try {
    const body = await callOpenRouter({
      prompt,
      imageBase64: data,
      imageMimeType: image.type,
      apiKey: effectiveApiKey,
      origin: defaultOrigin,
      model: "openai/gpt-4o",
    });

    const raw = body.choices?.[0]?.message?.content;
    const parsed = JSON.parse(typeof raw === "string" ? raw : raw?.[0]?.text || "{}");
    const confidence = Number(parsed.confidence) || 0;
    const valid = Boolean(parsed.isInstagram && parsed.targetAccountVisible && parsed.followingVisible && confidence >= 0.75);

    return {
      valid,
      isInstagram: !!parsed.isInstagram,
      targetAccountVisible: !!parsed.targetAccountVisible,
      followingVisible: !!parsed.followingVisible,
      confidence,
      reason: parsed.reason || (valid ? "Follow proof verified." : "We couldn't verify the screenshot clearly."),
    };
  } catch (err) {
    throw new Error(err.message || "The verification service is temporarily unavailable.");
  }
}
