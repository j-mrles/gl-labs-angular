import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { scrapeRealtor } from "@/lib/scraper/realtor";

const html = readFileSync(
  join(__dirname, "../../fixtures/realtor-listing.html"),
  "utf-8"
);
const url = "https://www.realtor.com/realestateandhomes-detail/789-Pine-Rd_Denver_CO_80202_M12345-67890";

describe("scrapeRealtor", () => {
  it("extracts address", () => {
    const data = scrapeRealtor(html, url);
    expect(data.address).toBe("789 Pine Rd, Denver, CO 80202");
  });

  it("extracts price", () => {
    const data = scrapeRealtor(html, url);
    expect(data.price).toBe(895000);
  });

  it("extracts beds", () => {
    const data = scrapeRealtor(html, url);
    expect(data.beds).toBe(5);
  });

  it("extracts baths", () => {
    const data = scrapeRealtor(html, url);
    expect(data.baths).toBe(4);
  });

  it("extracts sqft", () => {
    const data = scrapeRealtor(html, url);
    expect(data.sqft).toBe(3200);
  });

  it("extracts yearBuilt", () => {
    const data = scrapeRealtor(html, url);
    expect(data.yearBuilt).toBe(2012);
  });

  it("sets source to realtor", () => {
    const data = scrapeRealtor(html, url);
    expect(data.source).toBe("realtor");
  });

  it("sets rawUrl", () => {
    const data = scrapeRealtor(html, url);
    expect(data.rawUrl).toBe(url);
  });

  it("extracts photoUrls", () => {
    const data = scrapeRealtor(html, url);
    expect(data.photoUrls.length).toBeGreaterThan(0);
  });

  it("sets scrapedAt as ISO string", () => {
    const data = scrapeRealtor(html, url);
    expect(() => new Date(data.scrapedAt)).not.toThrow();
    expect(data.scrapedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
