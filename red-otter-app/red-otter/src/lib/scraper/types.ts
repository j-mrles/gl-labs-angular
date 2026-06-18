export interface PropertyData {
  address: string;
  price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  lotSize: string | null;
  yearBuilt: number | null;
  propertyType: string | null;
  hoaFees: number | null;
  taxHistory: string | null;
  description: string | null;
  listingAgent: string | null;
  daysOnMarket: number | null;
  priceChangeHistory: string | null;
  photoUrls: string[];
  source: "zillow" | "redfin" | "realtor" | "unknown";
  rawUrl: string;
  scrapedAt: string;
}
