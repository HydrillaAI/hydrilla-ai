/**
 * Detect search/AI crawlers that must not pull mesh or preview bytes through
 * the API (Fast Origin Transfer / function invocations). Keep in sync with
 * `CRAWLER_UA` in apps/frontend/lib/api.ts.
 */
const CRAWLER_UA =
  /bot|crawl|spider|slurp|googleother|google-inspectiontool|bytespider|petalbot|amazonbot|ahrefsbot|semrushbot|bingbot|yandex|baiduspider|duckduckbot|facebookexternalhit|linkedinbot|twitterbot|applebot|chatgpt|gptbot|claudebot|anthropic|perplexity|exasearch|elevenlabs|barkrowler|reflectionbot/i;

export function isCrawlerUserAgent(userAgent: string | undefined): boolean {
  if (!userAgent) {
    return false;
  }
  return CRAWLER_UA.test(userAgent);
}
