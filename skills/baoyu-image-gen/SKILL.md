---
name: baoyu-image-gen
description: AI image generation with multiple providers (Google, OpenAI, DashScope, SiliconFlow, Zhipu, Pollinations). Supports text-to-image, reference images, aspect ratios. Sequential by default; parallel generation available on request. Use when user asks to generate, create, or draw images.
---

# Image Generation (AI SDK)

Official API-based image generation. Supports 6 providers:

| Provider | Default Model | Best For |
|----------|---------------|----------|
| **Google** | gemini-3-pro-image-preview | Reference images, multimodal |
| **OpenAI** | gpt-image-1.5 | GPT ecosystem |
| **DashScope** | z-image-turbo | 阿里通义万象 |
| **SiliconFlow** | Qwen/Qwen-Image | 中文内容，高质量 |
| **Zhipu** | glm-image | 中文内容，智谱 AI |
| **Pollinations** | flux | 快速生成，英文内容 |

## Script Directory

**Agent Execution**:
1. `SKILL_DIR` = this SKILL.md file's directory
2. Script path = `${SKILL_DIR}/scripts/main.ts`

## Preferences (EXTEND.md)

Use Bash to check EXTEND.md existence (priority order):

```bash
# Check project-level first
test -f .baoyu-skills/baoyu-image-gen/EXTEND.md && echo "project"

# Then user-level (cross-platform: $HOME works on macOS/Linux/WSL)
test -f "$HOME/.baoyu-skills/baoyu-image-gen/EXTEND.md" && echo "user"
```

┌──────────────────────────────────────────────────┬───────────────────┐
│                       Path                       │     Location      │
├──────────────────────────────────────────────────┼───────────────────┤
│ .baoyu-skills/baoyu-image-gen/EXTEND.md          │ Project directory │
├──────────────────────────────────────────────────┼───────────────────┤
│ $HOME/.baoyu-skills/baoyu-image-gen/EXTEND.md    │ User home         │
└──────────────────────────────────────────────────┴───────────────────┘

┌───────────┬───────────────────────────────────────────────────────────────────────────┐
│  Result   │                                  Action                                   │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Found     │ Read, parse, apply settings                                               │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Not found │ Use defaults                                                              │
└───────────┴───────────────────────────────────────────────────────────────────────────┘

**EXTEND.md Supports**: Default provider | Default quality | Default aspect ratio | Default image size | Default models

Schema: `references/config/preferences-schema.md`

## Usage

```bash
# Basic
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image cat.png

# With aspect ratio
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A landscape" --image out.png --ar 16:9

# High quality
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image out.png --quality 2k

# From prompt files
npx -y bun ${SKILL_DIR}/scripts/main.ts --promptfiles system.md content.md --image out.png

# With reference images (Google multimodal or OpenAI edits)
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "Make blue" --image out.png --ref source.png

# With reference images (explicit provider/model)
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "Make blue" --image out.png --provider google --model gemini-3-pro-image-preview --ref source.png

# Specific provider
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image out.png --provider openai

# DashScope (阿里通义万象)
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "一只可爱的猫" --image out.png --provider dashscope

# SiliconFlow (硅基流动)
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "一只可爱的猫" --image out.png --provider siliconflow

# Zhipu (智谱 AI)
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "一只可爱的猫" --image out.png --provider zhipu

# Pollinations
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A cute cat" --image out.png --provider pollinations
```

## Options

| Option | Description |
|--------|-------------|
| `--prompt <text>`, `-p` | Prompt text |
| `--promptfiles <files...>` | Read prompt from files (concatenated) |
| `--image <path>` | Output image path (required) |
| `--provider google\|openai\|dashscope\|siliconflow\|zhipu\|pollinations` | Force provider (default: auto-detect by API key) |
| `--model <id>`, `-m` | Model ID (`--ref` with OpenAI requires GPT Image model, e.g. `gpt-image-1.5`) |
| `--ar <ratio>` | Aspect ratio (e.g., `16:9`, `1:1`, `4:3`) |
| `--size <WxH>` | Size (e.g., `1024x1024`) |
| `--quality normal\|2k` | Quality preset (default: 2k) |
| `--imageSize 1K\|2K\|4K` | Image size for Google (default: from quality) |
| `--ref <files...>` | Reference images. Supported by Google multimodal and OpenAI edits (GPT Image models). If provider omitted: Google first, then OpenAI |
| `--n <count>` | Number of images |
| `--json` | JSON output |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `GOOGLE_API_KEY` | Google API key |
| `GEMINI_API_KEY` | Gemini API key (alias for GOOGLE_API_KEY) |
| `DASHSCOPE_API_KEY` | DashScope API key (阿里云) |
| `SILICONFLOW_API_KEY` | SiliconFlow API key |
| `ZHIPU_API_KEY` | Zhipu AI API key (智谱 AI) |
| `POLLINATIONS_API_KEY` | Pollinations API key |
| `OPENAI_IMAGE_MODEL` | OpenAI model override |
| `GOOGLE_IMAGE_MODEL` | Google model override |
| `DASHSCOPE_IMAGE_MODEL` | DashScope model override (default: z-image-turbo) |
| `SILICONFLOW_IMAGE_MODEL` | SiliconFlow model override (default: Qwen/Qwen-Image) |
| `ZHIPU_IMAGE_MODEL` | Zhipu model override (default: glm-image) |
| `POLLINATIONS_IMAGE_MODEL` | Pollinations model override (default: flux) |
| `OPENAI_BASE_URL` | Custom OpenAI endpoint |
| `GOOGLE_BASE_URL` | Custom Google endpoint |
| `DASHSCOPE_BASE_URL` | Custom DashScope endpoint |
| `ZHIPU_BASE_URL` | Custom Zhipu endpoint |

**Load Priority**: CLI args > EXTEND.md > env vars > `<cwd>/.baoyu-skills/.env` > `~/.baoyu-skills/.env`

## Provider Selection

1. `--ref` provided + no `--provider` → auto-select Google first, then OpenAI
2. `--provider` specified → use it (if `--ref`, must be `google` or `openai`)
3. Only one API key available → use that provider
4. Multiple available → use first available in priority order: Google > OpenAI > DashScope > SiliconFlow > Zhipu > Pollinations

**Smart Provider Selection** (recommended):
- **中文内容** → Use `--provider zhipu` or `--provider siliconflow`
- **英文内容** → Use `--provider pollinations` (flux) for fast generation
- **Reference images** → Use `--provider google` (Gemini multimodal)
- **High quality Chinese** → Use `--provider siliconflow` (Qwen-Image)

## Quality Presets

| Preset | Google imageSize | OpenAI Size | Use Case |
|--------|------------------|-------------|----------|
| `normal` | 1K | 1024px | Quick previews |
| `2k` (default) | 2K | 2048px | Covers, illustrations, infographics |

**Google imageSize**: Can be overridden with `--imageSize 1K|2K|4K`

## Aspect Ratios

Supported: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `2.35:1`

- Google multimodal: uses `imageConfig.aspectRatio`
- Google Imagen: uses `aspectRatio` parameter
- OpenAI: maps to closest supported size

## Generation Mode

**Default**: Sequential generation (one image at a time). This ensures stable output and easier debugging.

**Parallel Generation**: Only use when user explicitly requests parallel/concurrent generation.

| Mode | When to Use |
|------|-------------|
| Sequential (default) | Normal usage, single images, small batches |
| Parallel | User explicitly requests, large batches (10+) |

**Parallel Settings** (when requested):

| Setting | Value |
|---------|-------|
| Recommended concurrency | 4 subagents |
| Max concurrency | 8 subagents |
| Use case | Large batch generation when user requests parallel |

**Agent Implementation** (parallel mode only):
```
# Launch multiple generations in parallel using Task tool
# Each Task runs as background subagent with run_in_background=true
# Collect results via TaskOutput when all complete
```

## Error Handling

- Missing API key → error with setup instructions
- Generation failure → auto-retry once
- Invalid aspect ratio → warning, proceed with default
- Reference images with unsupported provider/model → error with fix hint (switch to Google multimodal or OpenAI GPT Image edits)

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
