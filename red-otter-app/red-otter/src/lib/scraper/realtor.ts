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

export function scrapeRealtor(html: string, url: string): PropertyData {
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
      $(".listing-address").first().text().trim() ||
      $('meta[property="og:title"]').attr("content") ||
      "";
  }

  // Price
  let price: number | null = ld?.offers?.price !== undefined ? toNumber(ld.offers.price) : null;
  if (price === null) {
    price = toNumber($('[data-testid="listing-price"]').first().text());
  }

  // Beds
  let beds: number | null = ld?.numberOfRooms !== undefined ? toInt(ld.numberOfRooms) : null;
  if (beds === null) {
    beds = toInt($('[data-testid="property-meta-beds"]').first().text());
  }

  // Baths
  let baths: number | null = null;
  baths = toNumber($('[data-testid="property-meta-baths"]').first().text());

  // Sqft
  let sqft: number | null = ld?.floorSize?.value !== undefined ? toInt(ld.floorSize.value) : null;
  if (sqft === null) {
    sqft = toInt(
      $('[data-testid="property-meta-sqft"]').first().text().replace(/,/g, "")
    );
  }

  // Year built
  let yearBuilt: number | null = ld?.yearBuilt !== undefined ? toInt(ld.yearBuilt) : null;
  if (yearBuilt === null) {
    $(".ldp-key-fact-list li").each((_, el) => {
      const label = $(el).find(".key-fact-label").text().trim();
      if (/year built/i.test(label)) {
        yearBuilt = toInt($(el).find(".key-fact-value").text());
      }
    });
  }

  // Description
  const description =
    ld?.description ??
    ($(".listing-description-text").first().text().trim() ||
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
  $(".ldp-key-fact-list li").each((_, el) => {
    const label = $(el).find(".key-fact-label").text().trim();
    if (/lot size/i.test(label) && !lotSize) {
      lotSize = $(el).find(".key-fact-value").text().trim();
    }
  });

  // HOA fees
  let hoaFees: number | null = null;
  $(".ldp-key-fact-list li").each((_, el) => {
    const label = $(el).find(".key-fact-label").text().trim();
    if (/hoa fee/i.test(label) && !hoaFees) {
      hoaFees = toNumber($(el).find(".key-fact-value").text());
    }
  });

  // Property type
  let propertyType: string | null = null;
  $(".ldp-key-fact-list li").each((_, el) => {
    const label = $(el).find(".key-fact-label").text().trim();
    if (/property type/i.test(label) && !propertyType) {
      propertyType = $(el).find(".key-fact-value").text().trim();
    }
  });

  // Listing agent
  const listingAgent =
    $(".agent-name").first().text().trim() ||
    $(".ldp-listing-agent-container").first().text().replace(/listed by/i, "").trim() ||
    null;

  // Days on market
  let daysOnMarket: number | null = null;
  const domText = $(".days-on-realtor").first().text();
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
    source: "realtor",
    rawUrl: url,
    scrapedAt: new Date().toISOString(),
  };
}
