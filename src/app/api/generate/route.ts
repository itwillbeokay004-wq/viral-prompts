import { NextRequest } from "next/server";
import {
  getStaticPrompts,
  NICHES,
  PLATFORMS,
  type Niche,
  type Platform,
} from "@/lib/prompts";

export const runtime = "nodejs";

type GenerateBody = {
  niche?: string;
  platform?: string;
  count?: number;
};

function isNiche(v: string): v is Niche {
  return NICHES.some((n) => n.value === v);
}

function isPlatform(v: string): v is Platform {
  return PLATFORMS.some((p) => p.value === v);
}

async function generateWithOpenAI(
  niche: Niche,
  platform: Platform,
  count: number,
  apiKey: string
): Promise<string[] | null> {
  const platformLabel =
    PLATFORMS.find((p) => p.value === platform)?.label ?? platform;
  const nicheLabel = NICHES.find((n) => n.value === niche)?.label ?? niche;

  const system =
    "You generate viral short-form video prompt ideas. Return ONLY a JSON object " +
    'of the shape {"prompts": string[]} — no commentary, no markdown. Each prompt is a single catchy sentence (<= 120 chars), hook-first, scroll-stopping, written like a human creator.';
  const user = `Give me ${count} viral ${platformLabel} video ideas in the "${nicheLabel}" niche. Mix formats: POVs, lists, challenges, hot takes, day-in-the-life, tutorials. Avoid cliches. No hashtags. No numbering.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.95,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      console.error("OpenAI error", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as { prompts?: unknown };
    if (!Array.isArray(parsed.prompts)) return null;
    return parsed.prompts
      .filter((p): p is string => typeof p === "string" && p.length > 0)
      .slice(0, count);
  } catch (err) {
    console.error("OpenAI call failed", err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const niche = body.niche ?? "";
  const platform = body.platform ?? "";
  const count = Math.min(Math.max(body.count ?? 8, 1), 15);

  if (!isNiche(niche)) {
    return Response.json({ error: "Invalid niche" }, { status: 400 });
  }
  if (!isPlatform(platform)) {
    return Response.json({ error: "Invalid platform" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    const ai = await generateWithOpenAI(niche, platform, count, apiKey);
    if (ai && ai.length > 0) {
      return Response.json({ prompts: ai, source: "ai" });
    }
  }

  const prompts = getStaticPrompts(niche, platform, count);
  return Response.json({
    prompts,
    source: apiKey ? "fallback" : "static",
  });
}
