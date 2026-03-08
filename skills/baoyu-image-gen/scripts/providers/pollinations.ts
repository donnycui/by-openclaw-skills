import type { CliArgs } from "../types";

export function getDefaultModel(): string {
  return process.env.POLLINATIONS_IMAGE_MODEL || "flux";
}

function getApiKey(): string | null {
  return process.env.POLLINATIONS_API_KEY || null;
}

function parseAspectRatio(ar: string): { width: number; height: number } | null {
  const match = ar.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const w = parseFloat(match[1]!);
  const h = parseFloat(match[2]!);
  if (w <= 0 || h <= 0) return null;
  return { width: w, height: h };
}

function getSizeFromAspectRatio(ar: string | null, quality: CliArgs["quality"]): { width: number; height: number } {
  const baseSize = quality === "2k" ? 2048 : 1024;

  if (!ar) return { width: baseSize, height: baseSize };

  const parsed = parseAspectRatio(ar);
  if (!parsed) return { width: baseSize, height: baseSize };

  const ratio = parsed.width / parsed.height;

  if (ratio > 1) {
    return { width: Math.round(baseSize * ratio), height: baseSize };
  }

  return { width: baseSize, height: Math.round(baseSize / ratio) };
}

export async function generateImage(
  prompt: string,
  model: string,
  args: CliArgs
): Promise<Uint8Array> {
  if (args.referenceImages.length > 0) {
    throw new Error("Reference images are not supported with Pollinations provider.");
  }

  const size = getSizeFromAspectRatio(args.aspectRatio, args.quality);
  
  // Build Pollinations URL (using gen.pollinations.ai which is more reliable)
  const baseUrl = "https://gen.pollinations.ai/image";
  const encodedPrompt = encodeURIComponent(prompt);
  const params = new URLSearchParams({
    model,
    width: size.width.toString(),
    height: size.height.toString(),
    seed: (args.n || 1).toString(),
    nologo: "true",
  });

  const url = `${baseUrl}/${encodedPrompt}?${params.toString()}`;

  console.log(`Generating image with Pollinations (${model})...`, { size, model });

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pollinations API error (${res.status}): ${err}`);
  }

  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}
