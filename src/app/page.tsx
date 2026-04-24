"use client";

import { useState } from "react";
import { NICHES, PLATFORMS, type Niche, type Platform } from "@/lib/prompts";

type GenerateResponse = {
  prompts: string[];
  source: "ai" | "fallback" | "static";
};

export default function Home() {
  const [niche, setNiche] = useState<Niche>("comedy");
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [count, setCount] = useState(8);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [source, setSource] = useState<GenerateResponse["source"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setCopiedIdx(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, platform, count }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }
      const data = (await res.json()) as GenerateResponse;
      setPrompts(data.prompts);
      setSource(data.source);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copyOne(idx: number, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx((v) => (v === idx ? null : v)), 1500);
    } catch {
      // ignore
    }
  }

  async function copyAll() {
    if (prompts.length === 0) return;
    try {
      await navigator.clipboard.writeText(
        prompts.map((p, i) => `${i + 1}. ${p}`).join("\n")
      );
      setCopiedIdx(-1);
      setTimeout(() => setCopiedIdx((v) => (v === -1 ? null : v)), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen flex-1 bg-gradient-to-br from-fuchsia-50 via-white to-violet-50 dark:from-zinc-950 dark:via-black dark:to-zinc-950">
      <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-16">
        <header className="mb-8 text-center sm:mb-12">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-white/70 px-3 py-1 text-xs font-medium text-fuchsia-700 shadow-sm backdrop-blur dark:border-fuchsia-900 dark:bg-zinc-900/70 dark:text-fuchsia-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
            Viral Prompt Generator
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
            Go viral on{" "}
            <span className="bg-gradient-to-r from-fuchsia-500 via-rose-500 to-violet-500 bg-clip-text text-transparent">
              TikTok & YouTube
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-zinc-600 dark:text-zinc-400">
            Pick a niche and platform. Get scroll-stopping video ideas in one
            click.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Platform
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((p) => {
                  const active = platform === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPlatform(p.value)}
                      aria-pressed={active}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                        active
                          ? "border-fuchsia-500 bg-fuchsia-500 text-white shadow"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-fuchsia-300 hover:bg-fuchsia-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-fuchsia-700 dark:hover:bg-zinc-700"
                      }`}
                    >
                      <span className="mr-1.5">{p.emoji}</span>
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Niche
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {NICHES.map((n) => {
                  const active = niche === n.value;
                  return (
                    <button
                      key={n.value}
                      type="button"
                      onClick={() => setNiche(n.value)}
                      aria-pressed={active}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? "border-violet-500 bg-violet-500 text-white shadow"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-300 hover:bg-violet-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-violet-700 dark:hover:bg-zinc-700"
                      }`}
                    >
                      <span className="mr-1">{n.emoji}</span>
                      {n.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="count"
                className="mb-2 flex items-center justify-between text-sm font-semibold text-zinc-800 dark:text-zinc-200"
              >
                <span>Number of ideas</span>
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {count}
                </span>
              </label>
              <input
                id="count"
                type="range"
                min={3}
                max={15}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
                className="w-full accent-fuchsia-500"
              />
            </div>

            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 via-rose-500 to-violet-500 px-5 py-3.5 text-base font-semibold text-white shadow-md transition hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Cooking up ideas..." : "Generate viral prompts"}
            </button>

            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
            )}
          </div>
        </section>

        {prompts.length > 0 && (
          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Your ideas
              </h2>
              <div className="flex items-center gap-3">
                {source && (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {source === "ai"
                      ? "AI generated"
                      : source === "fallback"
                        ? "Fallback library"
                        : "Static library"}
                  </span>
                )}
                <button
                  type="button"
                  onClick={copyAll}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  {copiedIdx === -1 ? "Copied!" : "Copy all"}
                </button>
              </div>
            </div>

            <ul className="space-y-2">
              {prompts.map((p, i) => (
                <li
                  key={`${i}-${p}`}
                  className="group flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-fuchsia-200 hover:shadow dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-fuchsia-800"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-500 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                    {p}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyOne(i, p)}
                    aria-label={`Copy prompt ${i + 1}`}
                    className="shrink-0 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-600 opacity-0 transition group-hover:opacity-100 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    {copiedIdx === i ? "Copied" : "Copy"}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-12 text-center text-xs text-zinc-500 dark:text-zinc-600">
          Add <code className="font-mono">OPENAI_API_KEY</code> to enable
          AI-generated prompts. Static library used as fallback.
        </footer>
      </main>
    </div>
  );
}
