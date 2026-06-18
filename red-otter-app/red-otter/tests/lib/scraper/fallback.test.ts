import { describe, it, expect } from "vitest";
import { scrapeFallback } from "@/lib/scraper/fallback";

const minimalHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Some Property Listing</title>
  <meta property="og:title" content="321 Elm St, Portland, OR 97201" />
  <meta property="og:description" content="3 beds, 2 baths home for sale. Price: $500,000." />
  <meta property="og:image" content="https://example.com/photo.jpg" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SingleFamilyResidence",
    "name": "321 Elm St, Portland, OR 97201",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "321 Elm St",
      "addressLocality": "Portland",
      "addressRegion": "OR",
      "postalCode": "97201"
    },
    "offers": {
      "@type": "Offer",
      "price": 500000,
      "priceCurrency": "USD"
    },
    "numberOfRooms": 3,
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": 1600,
      "unitCode": "FTK"
    },
    "yearBuilt": 1995,
    "description": "A lovely home in Portland.",
    "image": ["https://example.com/photo.jpg"]
  }
  </script>
</head>
<body>
  <h1>321 Elm St, Portland, OR 97201</h1>
  <p>$500,000</p>
</body>
</html>`;

const url = "https://somesite.com/listing/321-elm-st";

describe("scrapeFallback", () => {
  it("extracts address from JSON-LD", () => {
    const data = scrapeFallback(minimalHtml, url);
    expect(data.address).toBe("321 Elm St, Portland, OR 97201");
  });

  it("extracts price from JSON-LD", () => {
    const data = scrapeFallback(minimalHtml, url);
    expect(data.price).toBe(500000);
  });

  it("extracts beds from JSON-LD", () => {
    const data = scrapeFallback(minimalHtml, url);
    expect(data.beds).toBe(3);
  });

  it("extracts sqft from JSON-LD", () => {
    const data = scrapeFallback(minimalHtml, url);
    expect(data.sqft).toBe(1600);
  });

  it("extracts yearBuilt from JSON-LD", () => {
    const data = scrapeFallback(minimalHtml, url);
    expect(data.yearBuilt).toBe(1995);
  });

  it("sets source to unknown", () => {
    const data = scrapeFallback(minimalHtml, url);
    expect(data.source).toBe("unknown");
  });

  it("sets rawUrl", () => {
    const data = scrapeFallback(minimalHtml, url);
    expect(data.rawUrl).toBe(url);
  });

  it("extracts photoUrls from JSON-LD", () => {
    const data = scrapeFallback(minimalHtml, url);
    expect(data.photoUrls).toContain("https://example.com/photo.jpg");
  });

  it("falls back to og:title when no JSON-LD name", () => {
    const noJsonLdHtml = `<!DOCTYPE html>
<html><head>
  <meta property="og:title" content="OG Title Address" />
</head><body></body></html>`;
    const data = scrapeFallback(noJsonLdHtml, url);
    expect(data.address).toBe("OG Title Address");
  });

  it("sets scrapedAt as ISO string", () => {
    const data = scrapeFallback(minimalHtml, url);
    expect(data.scrapedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
