import type { CliArgs } from "../types";

export function getDefaultModel(): string {
  return process.env.SILICONFLOW_IMAGE_MODEL || "Qwen/Qwen-Image";
}

function getApiKey(): string | null {
  return process.env.SILICONFLOW_API_KEY || null;
}

function getBaseUrl(): string {
  return "https://api.siliconflow.cn";
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
  const baseSize = quality === "2k" ? 1024 : 512;

  if (!ar) return `${baseSize}x${baseSize}`;

  const parsed = parseAspectRatio(ar);
  if (!parsed) return `${baseSize}x${baseSize}`;

  const ratio = parsed.width / parsed.height;

  if (Math.abs(ratio - 1) < 0.1) {
    return `${baseSize}x${baseSize}`;
  }

  if (ratio > 1) {
    const w = Math.round(baseSize * ratio);
    return `${w}x${baseSize}`;
  }

  const h = Math.round(baseSize / ratio);
  return `${baseSize}x${h}`;
}

export async function generateImage(
  prompt: string,
  model: string,
  args: CliArgs
): Promise<Uint8Array> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("SILICONFLOW_API_KEY is required");

  if (args.referenceImages.length > 0) {
    throw new Error("Reference images are not supported with SiliconFlow provider.");
  }

  const size = args.size || getSizeFromAspectRatio(args.aspectRatio, args.quality);
  const url = `${getBaseUrl()}/v1/images/generations`;

  const body = {
    model,
    prompt,
    size,
    n: args.n || 1,
  };

  console.log(`Generating image with SiliconFlow (${model})...`, { size });

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
    throw new Error(`SiliconFlow API error (${res.status}): ${err}`);
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
