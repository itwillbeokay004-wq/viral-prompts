import type { Platform } from "./prompts";

export function buildSearchUrl(platform: Platform, prompt: string): string {
  const q = encodeURIComponent(prompt);
  switch (platform) {
    case "tiktok":
      return `https://www.tiktok.com/search?q=${q}`;
    case "youtube":
      return `https://www.youtube.com/results?search_query=${q}`;
  }
}

export function buildUploadUrl(platform: Platform): string {
  switch (platform) {
    case "tiktok":
      return "https://www.tiktok.com/upload";
    case "youtube":
      return "https://studio.youtube.com/channel/upload";
  }
}
