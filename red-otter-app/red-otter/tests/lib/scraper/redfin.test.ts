import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { scrapeRedfin } from "@/lib/scraper/redfin";

const html = readFileSync(
  join(__dirname, "../../fixtures/redfin-listing.html"),
  "utf-8"
);
const url = "https://www.redfin.com/WA/Seattle/456-Oak-Ave-98101/home/12345";

describe("scrapeRedfin", () => {
  it("extracts address", () => {
    const data = scrapeRedfin(html, url);
    expect(data.address).toBe("456 Oak Ave, Seattle, WA 98101");
  });

  it("extracts price", () => {
    const data = scrapeRedfin(html, url);
    expect(data.price).toBe(625000);
  });

  it("extracts beds", () => {
    const data = scrapeRedfin(html, url);
    expect(data.beds).toBe(3);
  });

  it("extracts baths", () => {
    const data = scrapeRedfin(html, url);
    expect(data.baths).toBe(2);
  });

  it("extracts sqft", () => {
    const data = scrapeRedfin(html, url);
    expect(data.sqft).toBe(1850);
  });

  it("extracts yearBuilt", () => {
    const data = scrapeRedfin(html, url);
    expect(data.yearBuilt).toBe(1998);
  });

  it("sets source to redfin", () => {
    const data = scrapeRedfin(html, url);
    expect(data.source).toBe("redfin");
  });

  it("sets rawUrl", () => {
    const data = scrapeRedfin(html, url);
    expect(data.rawUrl).toBe(url);
  });

  it("extracts photoUrls", () => {
    const data = scrapeRedfin(html, url);
    expect(data.photoUrls.length).toBeGreaterThan(0);
  });

  it("sets scrapedAt as ISO string", () => {
    const data = scrapeRedfin(html, url);
    expect(() => new Date(data.scrapedAt)).not.toThrow();
    expect(data.scrapedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
