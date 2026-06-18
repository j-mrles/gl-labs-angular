import * as cheerio from "cheerio";
import type { PropertyData } from "./types";

interface JsonLd {
  name?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
  };
  offers?: { price?: number | string };
  numberOfRooms?: number | string;
  floorSize?: { value?: number | string };
  yearBuilt?: number | string;
  description?: string;
  image?: string | string[];
}

export function extractJsonLd(html: string): JsonLd | null {
  const $ = cheerio.load(html);
  let result: JsonLd | null = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    if (result) return;
    try {
      const parsed = JSON.parse($(el).html() ?? "");
      if (parsed && typeof parsed === "object") {
        result = parsed as JsonLd;
      }
    } catch {
      // ignore parse errors
    }
  });
  return result;
}

function buildAddress(ld: JsonLd): string {
  const a = ld.address;
  if (!a) return ld.name ?? "";
  // "123 Main St, Austin, TX 78701" — city+state+zip grouped
  const cityStateZip = [a.addressLocality, [a.addressRegion, a.postalCode].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  return [a.streetAddress, cityStateZip].filter(Boolean).join(", ");
}

function toNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = typeof val === "string" ? parseFloat(val.replace(/[^0-9.]/g, "")) : Number(val);
  return isNaN(n) ? null : n;
}

function toInt(val: unknown): number | null {
  const n = toNumber(val);
  return n !== null ? Math.round(n) : null;
}

export function scrapeFallback(html: string, url: string): PropertyData {
  const $ = cheerio.load(html);
  const ld = extractJsonLd(html);

  // Address: JSON-LD > og:title > page title
  let address = "";
  if (ld) {
    if (ld.address && (ld.address.streetAddress || ld.address.addressLocality)) {
      address = buildAddress(ld);
    } else if (ld.name) {
      address = ld.name;
    }
  }
  if (!address) {
    address = $('meta[property="og:title"]').attr("content") ?? $("title").text() ?? "";
  }

  const price = ld?.offers?.price !== undefined ? toNumber(ld.offers.price) : null;
  const beds = ld?.numberOfRooms !== undefined ? toInt(ld.numberOfRooms) : null;
  const sqft = ld?.floorSize?.value !== undefined ? toInt(ld.floorSize.value) : null;
  const yearBuilt = ld?.yearBuilt !== undefined ? toInt(ld.yearBuilt) : null;
  const description = ld?.description ?? $('meta[property="og:description"]').attr("content") ?? null;

  let photoUrls: string[] = [];
  if (ld?.image) {
    photoUrls = Array.isArray(ld.image) ? ld.image : [ld.image];
  }
  if (photoUrls.length === 0) {
    const ogImg = $('meta[property="og:image"]').attr("content");
    if (ogImg) photoUrls = [ogImg];
  }

  return {
    address,
    price,
    beds,
    baths: null,
    sqft,
    lotSize: null,
    yearBuilt,
    propertyType: null,
    hoaFees: null,
    taxHistory: null,
    description,
    listingAgent: null,
    daysOnMarket: null,
    priceChangeHistory: null,
    photoUrls,
    source: "unknown",
    rawUrl: url,
    scrapedAt: new Date().toISOString(),
  };
}
