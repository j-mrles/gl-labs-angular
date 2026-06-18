import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { scrapeZillow } from "@/lib/scraper/zillow";

const html = readFileSync(
  join(__dirname, "../../fixtures/zillow-listing.html"),
  "utf-8"
);
const url = "https://www.zillow.com/homedetails/123-main-st-austin-tx-78701/12345678_zpid/";

describe("scrapeZillow", () => {
  it("extracts address", () => {
    const data = scrapeZillow(html, url);
    expect(data.address).toBe("123 Main St, Austin, TX 78701");
  });

  it("extracts price", () => {
    const data = scrapeZillow(html, url);
    expect(data.price).toBe(750000);
  });

  it("extracts beds", () => {
    const data = scrapeZillow(html, url);
    expect(data.beds).toBe(4);
  });

  it("extracts baths", () => {
    const data = scrapeZillow(html, url);
    expect(data.baths).toBe(3);
  });

  it("extracts sqft", () => {
    const data = scrapeZillow(html, url);
    expect(data.sqft).toBe(2450);
  });

  it("extracts yearBuilt", () => {
    const data = scrapeZillow(html, url);
    expect(data.yearBuilt).toBe(2005);
  });

  it("sets source to zillow", () => {
    const data = scrapeZillow(html, url);
    expect(data.source).toBe("zillow");
  });

  it("sets rawUrl", () => {
    const data = scrapeZillow(html, url);
    expect(data.rawUrl).toBe(url);
  });

  it("extracts photoUrls", () => {
    const data = scrapeZillow(html, url);
    expect(data.photoUrls.length).toBeGreaterThan(0);
  });

  it("sets scrapedAt as ISO string", () => {
    const data = scrapeZillow(html, url);
    expect(() => new Date(data.scrapedAt)).not.toThrow();
    expect(data.scrapedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
