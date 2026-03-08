import type { CliArgs } from "../types";

export function getDefaultModel(): string {
  return process.env.ZHIPU_IMAGE_MODEL || "glm-image";
}

function getApiKey(): string | null {
  return process.env.ZHIPU_API_KEY || null;
}

function getBaseUrl(): string {
  const base = process.env.ZHIPU_BASE_URL || "https://open.bigmodel.cn";
  return base.replace(/\/+$/g, "");
}

function parseAspectRatio(ar: string): { width: number; height: number } | null {
  const match = ar.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const w = parseFloat(match[1]!);
  const h = parseFloat(match[2]!);
  if (w <= 0 || h <= 0) return null;
  return { width: w, height: h };
}

function getSizeFromAspectRatio(ar: string | null, quality: CliArgs["quality"]): string {
  const baseSize = quality === "2k" ? 1024 : 768;

  if (!ar) return `${baseSize}x${baseSize}`;

  const parsed = parseAspectRatio(ar);
  if (!parsed) return `${baseSize}x${baseSize}`;

  const ratio = parsed.width / parsed.height;

  // Map common aspect ratios to Zhipu supported sizes
  if (Math.abs(ratio - 1) < 0.1) {
    return "1024x1024";
  } else if (ratio > 1.5) {
    return "1344x768"; // 16:9 landscape
  } else if (ratio > 1) {
    return "1152x864"; // 4:3 landscape
  } else if (ratio < 0.6) {
    return "768x1344"; // 9:16 portrait
  } else {
    return "864x1152"; // 3:4 portrait
  }
}

export async function generateImage(
  prompt: string,
  model: string,
  args: CliArgs
): Promise<Uint8Array> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("ZHIPU_API_KEY is required");

  if (args.referenceImages.length > 0) {
    throw new Error("Reference images are not supported with Zhipu provider.");
  }

  const size = args.size || getSizeFromAspectRatio(args.aspectRatio, args.quality);
  // Fixed: Correct API path without duplicate /v4
  const url = `${getBaseUrl()}/api/paas/v4/images/generations`;

  const body = {
    model,
    prompt,
    size,
    n: args.n || 1,
  };

  console.log(`Generating image with Zhipu AI (${model})...`, { size });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zhipu API error (${res.status}): ${err}`);
  }

  const result = await res.json() as {
    data?: Array<{ url?: string }>;
  };

  if (!result.data || !result.data[0]?.url) {
    console.error("Response:", JSON.stringify(result, null, 2));
    throw new Error("No image in response");
  }

  const imageUrl = result.data[0].url;
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error("Failed to download image");
  const buf = await imgRes.arrayBuffer();
  return new Uint8Array(buf);
}
