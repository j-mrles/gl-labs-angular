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

export function scrapeRedfin(html: string, url: string): PropertyData {
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
    const street = $(".street-address").first().text().trim();
    const city = $(".cityStateZip").first().text().trim();
    address = [street, city].filter(Boolean).join(", ");
  }
  if (!address) {
    address = $('meta[property="og:title"]').attr("content") ?? "";
  }

  // Price
  let price: number | null = ld?.offers?.price !== undefined ? toNumber(ld.offers.price) : null;
  if (price === null) {
    price = toNumber($(".price").first().text());
  }

  // Beds
  let beds: number | null = ld?.numberOfRooms !== undefined ? toInt(ld.numberOfRooms) : null;
  if (beds === null) {
    beds = toInt($(".stat-block-beds-value").first().text()) ??
           toInt($(".beds").first().text());
  }

  // Baths
  let baths: number | null = null;
  baths = toNumber($(".stat-block-baths-value").first().text()) ??
          toNumber($(".baths").first().text());

  // Sqft
  let sqft: number | null = ld?.floorSize?.value !== undefined ? toInt(ld.floorSize.value) : null;
  if (sqft === null) {
    sqft = toInt($(".stat-block-sqft-value").first().text().replace(/,/g, "")) ??
           toInt($(".sqft").first().text().replace(/,/g, ""));
  }

  // Year built
  let yearBuilt: number | null = ld?.yearBuilt !== undefined ? toInt(ld.yearBuilt) : null;
  if (yearBuilt === null) {
    $(".keyDetails").each((_, el) => {
      const label = $(el).find("span").first().text().trim();
      if (/year built/i.test(label)) {
        yearBuilt = toInt($(el).find("span").last().text());
      }
    });
  }

  // Description
  const description =
    ld?.description ??
    ($(".remarks").first().text().trim() ||
    $('meta[property="og:description"]').attr("content") ||
    null);

  // Photos
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
  $(".keyDetails").each((_, el) => {
    const label = $(el).find("span").first().text().trim();
    if (/lot size/i.test(label) && !lotSize) {
      lotSize = $(el).find("span").last().text().trim();
    }
  });

  // HOA fees
  let hoaFees: number | null = null;
  $(".keyDetails").each((_, el) => {
    const label = $(el).find("span").first().text().trim();
    if (/hoa/i.test(label) && !hoaFees) {
      hoaFees = toNumber($(el).find("span").last().text());
    }
  });

  // Property type
  let propertyType: string | null = null;
  $(".keyDetails").each((_, el) => {
    const label = $(el).find("span").first().text().trim();
    if (/property type/i.test(label) && !propertyType) {
      propertyType = $(el).find("span").last().text().trim();
    }
  });

  // Listing agent
  const listingAgent = $(".listing-agent-name").first().text().trim() || null;

  // Days on market
  let daysOnMarket: number | null = null;
  const domText = $(".days-on-redfin").first().text();
  const match = domText.match(/(\d+)\s*days?/i);
  if (match) daysOnMarket = parseInt(match[1], 10);

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
    source: "redfin",
    rawUrl: url,
    scrapedAt: new Date().toISOString(),
  };
}
