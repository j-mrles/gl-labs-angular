import type { PropertyData } from "./types";
import { scrapeZillow } from "./zillow";
import { scrapeRedfin } from "./redfin";
import { scrapeRealtor } from "./realtor";
import { scrapeFallback } from "./fallback";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function scrapeListingUrl(url: string): Promise<PropertyData> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const hostname = new URL(url).hostname.toLowerCase();

  if (hostname.includes("zillow.com")) {
    return scrapeZillow(html, url);
  } else if (hostname.includes("redfin.com")) {
    return scrapeRedfin(html, url);
  } else if (hostname.includes("realtor.com")) {
    return scrapeRealtor(html, url);
  } else {
    return scrapeFallback(html, url);
  }
}

export { scrapeZillow } from "./zillow";
export { scrapeRedfin } from "./redfin";
export { scrapeRealtor } from "./realtor";
export { scrapeFallback } from "./fallback";
export type { PropertyData } from "./types";
