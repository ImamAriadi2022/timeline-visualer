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
  const prompt = `Inspect this screenshot only. Target Instagram account: ${targetAccount} (or imam_dev33). Return JSON only: valid, isInstagram, targetAccountVisible, followingVisible, confidence (0..1), reason. valid is true only when Instagram, exact account ${targetAccount}, and Following status are clearly visible with confidence at least .75. Provide a short Indonesian explanation in reason if invalid.`;

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
