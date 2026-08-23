import { callOpenRouter } from "@/shared/services/openrouter.service";

const targetAccount = process.env.INSTAGRAM_TARGET || "@imam_dev33";

export async function verifyFollowProof({ image, apiKey, origin }) {
  if (!(image instanceof File) || !image.type.startsWith("image/") || image.size > 8 * 1024 * 1024) {
    return { valid: false, reason: "Unggah gambar PNG, JPG, atau WebP yang jelas dan lebih kecil dari 8 MB." };
  }

  const effectiveApiKey = apiKey || process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY || process.env["ai-api-key"];
  if (!effectiveApiKey) {
    return { valid: false, reason: "Layanan verifikasi belum dikonfigurasi di server ini (AI_API_KEY belum disetel)." };
  }

  const defaultOrigin =
    origin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://timeline-visualer.vercel.app");

  const data = Buffer.from(await image.arrayBuffer()).toString("base64");

  const prompt = `Inspect this screenshot carefully.
Target Instagram Account to verify: ${targetAccount} (or imam_dev33 / imam_dev).

Evaluate whether this screenshot shows an active Instagram profile page of ${targetAccount} and the user is currently FOLLOWING this account.

Guidelines:
1. Instagram Profile: Check if this is an authentic Instagram profile screen showing the handle "imam_dev33" or name "imam_dev".
2. Follow Status:
   - In Indonesian language Instagram UI, the active following button says "Mengikuti" (often with a dropdown chevron or checked icon).
   - In English language Instagram UI, it says "Following" or "Requested".
   - If the button displays "Ikuti", "Follow", "Ikuti Balik", or "Follow Back", the user is NOT following yet (valid: false).
   - If the button displays "Mengikuti" or "Following", the user IS following (valid: true).

Return JSON only with this schema:
{
  "valid": true/false,
  "isInstagram": true/false,
  "targetAccountVisible": true/false,
  "followingVisible": true/false,
  "detectedAccount": "account handle or name seen in screenshot",
  "detectedButtonStatus": "exact button text seen, e.g. Mengikuti",
  "confidence": number between 0.0 and 1.0,
  "reason": "Penjelasan singkat dalam bahasa Indonesia"
}`;

  try {
    const body = await callOpenRouter({
      prompt,
      imageBase64: data,
      imageMimeType: image.type,
      apiKey: effectiveApiKey,
      origin: defaultOrigin,
      model: "openai/gpt-4o",
      maxTokens: 400,
    });

    const raw = body.choices?.[0]?.message?.content;
    const parsed = JSON.parse(typeof raw === "string" ? raw : raw?.[0]?.text || "{}");
    const confidence = Number(parsed.confidence) || 0;

    // Check validity
    const isTargetMatch = Boolean(
      parsed.targetAccountVisible ||
      (parsed.detectedAccount && parsed.detectedAccount.toLowerCase().includes("imam"))
    );

    const isFollowing = Boolean(
      parsed.followingVisible ||
      (parsed.detectedButtonStatus &&
        (parsed.detectedButtonStatus.toLowerCase().includes("mengikuti") ||
         parsed.detectedButtonStatus.toLowerCase().includes("following")))
    );

    const valid = Boolean(parsed.valid || (parsed.isInstagram && isTargetMatch && isFollowing && confidence >= 0.7));

    return {
      valid,
      isInstagram: !!parsed.isInstagram,
      targetAccountVisible: isTargetMatch,
      followingVisible: isFollowing,
      confidence: confidence || (valid ? 0.95 : 0.5),
      reason:
        parsed.reason ||
        (valid
          ? "Bukti follow terverifikasi."
          : `Tangkapan layar tidak dapat diverifikasi secara jelas. Pastikan akun ${targetAccount} dan status Mengikuti (Following) terlihat jelas.`),
    };
  } catch (err) {
    throw new Error(err.message || "Layanan verifikasi sedang tidak dapat diakses.");
  }
}
