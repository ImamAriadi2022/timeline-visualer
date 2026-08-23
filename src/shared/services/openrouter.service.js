/**
 * OpenRouter AI completion service (server-only)
 */
export async function callOpenRouter({
  prompt,
  imageBase64,
  imageMimeType = "image/png",
  apiKey = process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY || process.env["ai-api-key"],
  origin = process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://timeline-visualer.vercel.app"),
  model = "openai/gpt-4o",
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

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": origin,
      "X-Title": "Timeline Visualizer",
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content }],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API call failed with status ${response.status}`);
  }

  return response.json();
}
