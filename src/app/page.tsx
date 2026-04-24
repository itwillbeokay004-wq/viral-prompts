"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NICHES, PLATFORMS, type Niche, type Platform } from "@/lib/prompts";
import { useLocalStorage } from "@/lib/storage";
import { buildSearchUrl, buildUploadUrl } from "@/lib/share";

type GenerateResponse = {
  prompts: string[];
  source: "ai" | "fallback" | "static";
};

type FavoriteEntry = {
  text: string;
  niche: Niche;
  platform: Platform;
  savedAt: number;
};

type Toast = { id: number; text: string };

type Theme = "light" | "dark" | "system";

export default function Home() {
  const [niche, setNiche] = useLocalStorage<Niche>("vp:niche", "comedy");
  const [platform, setPlatform] = useLocalStorage<Platform>(
    "vp:platform",
    "tiktok"
  );
  const [count, setCount] = useLocalStorage<number>("vp:count", 8);
  const [favorites, setFavorites] = useLocalStorage<FavoriteEntry[]>(
    "vp:favorites",
    []
  );
  const [theme, setTheme] = useLocalStorage<Theme>("vp:theme", "system");

  const [tab, setTab] = useState<"generate" | "favorites">("generate");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [source, setSource] = useState<GenerateResponse["source"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Apply theme to <html>
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const dark = theme === "dark" || (theme === "system" && prefersDark);
      root.classList.toggle("dark", dark);
    };
    apply();
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const pushToast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 1800);
  }, []);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
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
      // Smooth scroll to results after they render
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 60);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [niche, platform, count]);

  // Enter anywhere to generate (except when typing in inputs)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter") return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      if (!loading) generate();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [generate, loading]);

  const copy = useCallback(
    async (text: string, label = "Copied!") => {
      try {
        await navigator.clipboard.writeText(text);
        pushToast(label);
      } catch {
        pushToast("Couldn't copy");
      }
    },
    [pushToast]
  );

  const copyAll = useCallback(() => {
    if (prompts.length === 0) return;
    copy(
      prompts.map((p, i) => `${i + 1}. ${p}`).join("\n"),
      `Copied ${prompts.length} prompts`
    );
  }, [prompts, copy]);

  const isFavorite = useCallback(
    (text: string) => favorites.some((f) => f.text === text),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (text: string) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.text === text);
        if (exists) {
          pushToast("Removed from favorites");
          return prev.filter((f) => f.text !== text);
        }
        pushToast("Saved to favorites");
        return [
          ...prev,
          { text, niche, platform, savedAt: Date.now() },
        ];
      });
    },
    [setFavorites, niche, platform, pushToast]
  );

  const clearFavorites = useCallback(() => {
    if (favorites.length === 0) return;
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        `Remove all ${favorites.length} favorites? This can't be undone.`
      );
      if (!ok) return;
    }
    setFavorites([]);
    pushToast("Favorites cleared");
  }, [favorites.length, setFavorites, pushToast]);

  const exampleSeeds = useMemo(() => {
    const pool = [
      "Rating the most viral trends from 1 to 10 — brutally honest",
      "POV: you just discovered the one thing nobody is talking about",
      "Things I wish I knew before getting into this",
      "Stop doing this. Do THIS instead (and thank me later)",
    ];
    return pool;
  }, []);

  const nextTheme: Theme =
    theme === "light" ? "dark" : theme === "dark" ? "system" : "light";

  return (
    <div className="min-h-screen flex-1 bg-gradient-to-br from-fuchsia-50 via-white to-violet-50 text-zinc-900 dark:from-zinc-950 dark:via-black dark:to-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-200/60 bg-white/70 backdrop-blur dark:border-zinc-800/60 dark:bg-black/60">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <div
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500 via-rose-500 to-violet-500 text-lg shadow-sm"
            >
              ✨
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">
                Viral Prompts
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                TikTok & YouTube idea machine
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <nav className="mr-1 flex rounded-full border border-zinc-200 bg-white p-0.5 text-xs font-medium shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setTab("generate")}
                className={`rounded-full px-3 py-1 transition ${
                  tab === "generate"
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                Generate
              </button>
              <button
                type="button"
                onClick={() => setTab("favorites")}
                className={`rounded-full px-3 py-1 transition ${
                  tab === "favorites"
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <span>Favorites</span>
                  {favorites.length > 0 && (
                    <span className="rounded-full bg-fuchsia-500 px-1.5 text-[10px] font-bold text-white">
                      {favorites.length}
                    </span>
                  )}
                </span>
              </button>
            </nav>

            <button
              type="button"
              onClick={() => setTheme(nextTheme)}
              title={`Theme: ${theme} (click to cycle)`}
              aria-label="Toggle theme"
              className="grid h-8 w-8 place-items-center rounded-full border border-zinc-200 bg-white text-sm shadow-sm transition hover:border-fuchsia-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-fuchsia-700"
            >
              {theme === "light" ? "🌞" : theme === "dark" ? "🌙" : "💻"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:py-12">
        {tab === "generate" ? (
          <>
            <section className="mb-8 text-center sm:mb-10">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Go viral on{" "}
                <span className="bg-gradient-to-r from-fuchsia-500 via-rose-500 to-violet-500 bg-clip-text text-transparent">
                  TikTok & YouTube
                </span>
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-base text-zinc-600 dark:text-zinc-400">
                Pick a platform and niche. Get scroll-stopping video ideas in
                one click. Press{" "}
                <kbd className="mx-0.5 rounded border border-zinc-300 bg-white px-1.5 font-mono text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                  Enter
                </kbd>{" "}
                any time to generate.
              </p>
            </section>

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
                  {loading ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Spinner />
                      Cooking up ideas…
                    </span>
                  ) : prompts.length > 0 ? (
                    "Regenerate"
                  ) : (
                    "Generate viral prompts"
                  )}
                </button>

                {error && (
                  <p
                    role="alert"
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
                  >
                    {error}
                  </p>
                )}
              </div>
            </section>

            <section ref={resultsRef} className="mt-8">
              {loading && prompts.length === 0 && <SkeletonList count={count} />}

              {!loading && prompts.length === 0 && !error && (
                <EmptyState seeds={exampleSeeds} />
              )}

              {prompts.length > 0 && (
                <>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold">Your ideas</h2>
                    <div className="flex items-center gap-2">
                      {source && (
                        <span className="hidden rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 sm:inline dark:bg-zinc-800 dark:text-zinc-400">
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
                        Copy all
                      </button>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {prompts.map((p, i) => (
                      <PromptCard
                        key={`${i}-${p}`}
                        index={i + 1}
                        text={p}
                        platform={platform}
                        isFav={isFavorite(p)}
                        onCopy={() => copy(p)}
                        onToggleFav={() => toggleFavorite(p)}
                      />
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-500">
                    <span>Not feeling them? Hit Regenerate for fresh ideas.</span>
                    <a
                      href={buildUploadUrl(platform)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-fuchsia-600 hover:underline dark:text-fuchsia-400"
                    >
                      Open{" "}
                      {PLATFORMS.find((p) => p.value === platform)?.label}{" "}
                      uploader →
                    </a>
                  </div>
                </>
              )}
            </section>
          </>
        ) : (
          <FavoritesView
            favorites={favorites}
            onCopy={copy}
            onRemove={(t) => toggleFavorite(t)}
            onClearAll={clearFavorites}
            onGoGenerate={() => setTab("generate")}
          />
        )}

        <footer className="mt-16 text-center text-xs text-zinc-500 dark:text-zinc-600">
          Built with Next.js + Tailwind. Set{" "}
          <code className="font-mono">OPENAI_API_KEY</code> for AI generation;
          curated library is used as fallback.
        </footer>
      </main>

      {/* Toasts */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-enter pointer-events-auto rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-lg dark:bg-white dark:text-zinc-900"
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  );
}

function SkeletonList({ count }: { count: number }) {
  return (
    <ul className="space-y-2">
      {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
        <li
          key={i}
          className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-[85%] animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-[60%] animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ seeds }: { seeds: string[] }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
      <div className="mb-2 text-3xl">🎬</div>
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Pick a vibe above, hit Generate, and go viral.
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
        Here&apos;s the kind of thing you&apos;ll get:
      </p>
      <ul className="mx-auto mt-4 max-w-md space-y-1.5 text-left">
        {seeds.map((s) => (
          <li
            key={s}
            className="rounded-lg bg-zinc-100/70 px-3 py-2 text-xs text-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-300"
          >
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PromptCard({
  index,
  text,
  platform,
  isFav,
  onCopy,
  onToggleFav,
}: {
  index: number;
  text: string;
  platform: Platform;
  isFav: boolean;
  onCopy: () => void;
  onToggleFav: () => void;
}) {
  return (
    <li className="group flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-fuchsia-200 hover:shadow dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-fuchsia-800">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-500 text-xs font-bold text-white">
        {index}
      </span>
      <p className="flex-1 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
        {text}
      </p>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onToggleFav}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          title={isFav ? "Remove from favorites" : "Add to favorites"}
          className={`grid h-8 w-8 place-items-center rounded-md border text-sm transition ${
            isFav
              ? "border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
              : "border-zinc-200 bg-white text-zinc-500 hover:text-amber-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {isFav ? "★" : "☆"}
        </button>
        <a
          href={buildSearchUrl(platform, text)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Check this idea on the platform"
          title={`Search ${PLATFORMS.find((p) => p.value === platform)?.label} for this idea`}
          className="grid h-8 w-8 place-items-center rounded-md border border-zinc-200 bg-white text-xs text-zinc-600 transition hover:border-fuchsia-300 hover:text-fuchsia-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:text-fuchsia-400"
        >
          🔎
        </a>
        <button
          type="button"
          onClick={onCopy}
          aria-label="Copy prompt"
          title="Copy prompt"
          className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Copy
        </button>
      </div>
    </li>
  );
}

function FavoritesView({
  favorites,
  onCopy,
  onRemove,
  onClearAll,
  onGoGenerate,
}: {
  favorites: FavoriteEntry[];
  onCopy: (text: string) => void;
  onRemove: (text: string) => void;
  onClearAll: () => void;
  onGoGenerate: () => void;
}) {
  if (favorites.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/50 p-10 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
        <div className="mb-2 text-3xl">⭐</div>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          No favorites yet.
        </p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          Tap the star on any prompt to save it here. Favorites are stored in
          your browser.
        </p>
        <button
          type="button"
          onClick={onGoGenerate}
          className="mt-4 rounded-lg bg-gradient-to-r from-fuchsia-500 via-rose-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow"
        >
          Generate some prompts
        </button>
      </div>
    );
  }

  const sorted = [...favorites].sort((a, b) => b.savedAt - a.savedAt);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Favorites{" "}
          <span className="ml-1 text-sm font-normal text-zinc-500">
            ({favorites.length})
          </span>
        </h2>
        <button
          type="button"
          onClick={onClearAll}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-rose-300 hover:text-rose-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-rose-700 dark:hover:text-rose-400"
        >
          Clear all
        </button>
      </div>
      <ul className="space-y-2">
        {sorted.map((f) => {
          const nicheMeta = NICHES.find((n) => n.value === f.niche);
          const platformMeta = PLATFORMS.find((p) => p.value === f.platform);
          return (
            <li
              key={`${f.text}-${f.savedAt}`}
              className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-100 text-xs text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                ★
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {f.text}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-500">
                  {platformMeta && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                      {platformMeta.emoji} {platformMeta.label}
                    </span>
                  )}
                  {nicheMeta && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                      {nicheMeta.emoji} {nicheMeta.label}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <a
                  href={buildSearchUrl(f.platform, f.text)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Search ${platformMeta?.label}`}
                  className="grid h-8 w-8 place-items-center rounded-md border border-zinc-200 bg-white text-xs text-zinc-600 transition hover:text-fuchsia-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  🔎
                </a>
                <button
                  type="button"
                  onClick={() => onCopy(f.text)}
                  className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(f.text)}
                  aria-label="Remove favorite"
                  title="Remove favorite"
                  className="grid h-8 w-8 place-items-center rounded-md border border-zinc-200 bg-white text-sm text-zinc-500 transition hover:border-rose-300 hover:text-rose-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  ✕
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
