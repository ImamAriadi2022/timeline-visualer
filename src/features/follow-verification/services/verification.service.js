const targetAccount = process.env.INSTAGRAM_TARGET || "@timelinevisualizer";

export async function verifyFollowProof({ image, apiKey, origin }) {
  if (!(image instanceof File) || !image.type.startsWith("image/") || image.size > 8 * 1024 * 1024) {
    return { valid: false, reason: "Upload a clear PNG, JPG, or WebP image smaller than 8 MB." };
  }
  if (!apiKey) return { valid: false, reason: "Verification is not configured on this server." };
  const data = Buffer.from(await image.arrayBuffer()).toString("base64");
  const prompt = `Inspect this screenshot only. Target Instagram account: ${targetAccount}. Return JSON only: valid, isInstagram, targetAccountVisible, followingVisible, confidence (0..1), reason. valid is true only when Instagram, exact account, and Following are clearly visible with confidence at least .75. Screenshot evidence is not proof of a real follow.`;
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": origin || "http://localhost:3000", "X-Title": "Timeline Visualizer" },
    body: JSON.stringify({ model: "openai/gpt-4o", response_format: { type: "json_object" }, messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: `data:${image.type};base64,${data}` } }] }] }),
  });
  if (!response.ok) throw new Error("The verification service is temporarily unavailable.");
  const body = await response.json();
  const raw = body.choices?.[0]?.message?.content;
  const parsed = JSON.parse(typeof raw === "string" ? raw : raw?.[0]?.text || "{}");
  const confidence = Number(parsed.confidence) || 0;
  const valid = Boolean(parsed.isInstagram && parsed.targetAccountVisible && parsed.followingVisible && confidence >= 0.75);
  return { valid, isInstagram: !!parsed.isInstagram, targetAccountVisible: !!parsed.targetAccountVisible, followingVisible: !!parsed.followingVisible, confidence, reason: parsed.reason || (valid ? "Follow proof verified." : "We couldn't verify the screenshot clearly.") };
}
