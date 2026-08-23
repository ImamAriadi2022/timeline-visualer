/**
 * OpenRouter AI vision completion service (server-only)
 */
export async function callOpenRouter({
  prompt,
  imageBase64,
  imageMimeType = "image/png",
  apiKey = process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY || process.env["ai-api-key"],
  origin = process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://timeline-visualer.vercel.app"),
  model = "openai/gpt-4o",
  maxTokens = 400,
}) {
  if (!apiKey) {
    throw new Error("AI_API_KEY is not configured on this server.");
  }

  const content = [{ type: "text", text: prompt }];

  if (imageBase64) {
    content.push({
      type: "image_url",
      image_url: {
        url: `data:${imageMimeType};base64,${imageBase64}`,
      },
    });
  }

  // Attempt primary model, fallback to gpt-4o-mini if necessary
  const candidateModels = [model, "openai/gpt-4o-mini"].filter(
    (m, idx, arr) => arr.indexOf(m) === idx
  );

  let lastError = null;

  for (const currentModel of candidateModels) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": origin,
          "X-Title": "Timeline Visualizer",
        },
        body: JSON.stringify({
          model: currentModel,
          max_tokens: maxTokens,
          response_format: { type: "json_object" },
          messages: [{ role: "user", content }],
        }),
      });

      if (response.ok) {
        return await response.json();
      }

      const errBody = await response.json().catch(() => ({}));
      lastError = new Error(
        errBody.error?.message || `OpenRouter API returned status ${response.status}`
      );
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("OpenRouter API call failed");
}
