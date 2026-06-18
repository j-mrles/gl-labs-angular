import * as cheerio from "cheerio";
import { extractJsonLd } from "./fallback";
import type { PropertyData } from "./types";

function toNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = typeof val === "string" ? parseFloat(val.replace(/[^0-9.]/g, "")) : Number(val);
  return isNaN(n) ? null : n;
}

function toInt(val: unknown): number | null {
  const n = toNumber(val);
  return n !== null ? Math.round(n) : null;
}

export function scrapeZillow(html: string, url: string): PropertyData {
  const $ = cheerio.load(html);
  const ld = extractJsonLd(html);

  // Address
  let address = "";
  if (ld?.name) {
    address = ld.name;
  } else if (ld?.address) {
    const a = ld.address as Record<string, string>;
    address = [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode]
      .filter(Boolean)
      .join(", ");
  }
  if (!address) {
    address =
      $('[data-testid="home-details-chip"]').first().text().trim() ||
      $('meta[property="og:title"]').attr("content") ||
      "";
  }

  // Price
  let price: number | null = null;
  if (ld?.offers?.price !== undefined) {
    price = toNumber(ld.offers.price);
  }
  if (price === null) {
    const priceText = $('[data-testid="price"]').first().text();
    price = toNumber(priceText);
  }

  // Beds
  let beds: number | null = ld?.numberOfRooms !== undefined ? toInt(ld.numberOfRooms) : null;
  if (beds === null) {
    $('[data-testid="bed-bath-item"]').each((_, el) => {
      const text = $(el).text();
      if (/bds|beds?/i.test(text) && beds === null) {
        beds = toInt(text.replace(/[^0-9]/g, ""));
      }
    });
  }

  // Baths — Zillow JSON-LD doesn't expose baths directly; parse from page
  let baths: number | null = null;
  $('[data-testid="bed-bath-item"]').each((_, el) => {
    const text = $(el).text();
    if (/ba\b|baths?/i.test(text) && baths === null) {
      baths = toNumber(text.replace(/[^0-9.]/g, ""));
    }
  });

  // Sqft
  let sqft: number | null = ld?.floorSize?.value !== undefined ? toInt(ld.floorSize.value) : null;
  if (sqft === null) {
    $('[data-testid="bed-bath-item"]').each((_, el) => {
      const text = $(el).text();
      if (/sqft|sq ft/i.test(text) && sqft === null) {
        sqft = toInt(text.replace(/,/g, "").replace(/[^0-9]/g, ""));
      }
    });
  }

  // Year built
  let yearBuilt: number | null = ld?.yearBuilt !== undefined ? toInt(ld.yearBuilt) : null;

  // Description
  const description =
    ld?.description ??
    ($(".ds-overview-section").first().text().trim() ||
    $('meta[property="og:description"]').attr("content") ||
    null);

  // Photo URLs
  let photoUrls: string[] = [];
  if (ld?.image) {
    photoUrls = Array.isArray(ld.image) ? ld.image : [ld.image];
  }
  if (photoUrls.length === 0) {
    const ogImg = $('meta[property="og:image"]').attr("content");
    if (ogImg) photoUrls = [ogImg];
  }

  // Lot size
  let lotSize: string | null = null;
  $(".ds-home-details-chip span, .ds-home-fact-value").each((_, el) => {
    const text = $(el).text();
    if (/lot/i.test(text) && !lotSize) {
      lotSize = text.replace(/lot[:\s]*/i, "").trim();
    }
  });

  // HOA fees
  let hoaFees: number | null = null;
  $(".ds-home-details-chip span").each((_, el) => {
    const text = $(el).text();
    if (/hoa/i.test(text) && !hoaFees) {
      hoaFees = toNumber(text);
    }
  });

  // Property type
  let propertyType: string | null = ld
    ? ((ld as Record<string, unknown>)["@type"] as string) ?? null
    : null;

  // Listing agent
  const listingAgent =
    $(".ds-listing-agent-display-name").first().text().trim() || null;

  // Days on market
  let daysOnMarket: number | null = null;
  const domText = $(".ds-days-on-zillow").first().text();
  if (domText) {
    const match = domText.match(/(\d+)\s*days?/i);
    if (match) daysOnMarket = parseInt(match[1], 10);
  }

  return {
    address,
    price,
    beds,
    baths,
    sqft,
    lotSize,
    yearBuilt,
    propertyType,
    hoaFees,
    taxHistory: null,
    description: description || null,
    listingAgent,
    daysOnMarket,
    priceChangeHistory: null,
    photoUrls,
    source: "zillow",
    rawUrl: url,
    scrapedAt: new Date().toISOString(),
  };
}
