import { llmComplete } from "@/lib/llm";
import type { PropertyData } from "@/lib/scraper/types";
import { calculateTrueCost } from "@/lib/finance/calculations";
import { ANALYSIS_PROMPT } from "./prompts";
import type { ReportAnalysis } from "./types";

const DEFAULT_INTEREST_RATE = 7.0;
const DEFAULT_DOWN_PAYMENT_PERCENT = 20;
const DEFAULT_LOAN_TERM_YEARS = 30;
const DEFAULT_ANNUAL_INSURANCE_RATE = 0.005;
const DEFAULT_ANNUAL_TAX_RATE = 0.012;

export async function analyzeProperty(
  property: PropertyData
): Promise<{ analysis: ReportAnalysis; trueCost: ReturnType<typeof calculateTrueCost> }> {
  const price = property.price ?? 500_000;

  const trueCost = calculateTrueCost({
    price,
    downPaymentPercent: DEFAULT_DOWN_PAYMENT_PERCENT,
    interestRate: DEFAULT_INTEREST_RATE,
    loanTermYears: DEFAULT_LOAN_TERM_YEARS,
    annualPropertyTax: price * DEFAULT_ANNUAL_TAX_RATE,
    annualInsurance: price * DEFAULT_ANNUAL_INSURANCE_RATE,
    monthlyHoa: property.hoaFees ?? 0,
  });

  const propertyJson = JSON.stringify(
    {
      address: property.address,
      price: property.price,
      beds: property.beds,
      baths: property.baths,
      sqft: property.sqft,
      lotSize: property.lotSize,
      yearBuilt: property.yearBuilt,
      propertyType: property.propertyType,
      hoaFees: property.hoaFees,
      taxHistory: property.taxHistory,
      description: property.description,
      daysOnMarket: property.daysOnMarket,
      priceChangeHistory: property.priceChangeHistory,
      source: property.source,
    },
    null,
    2
  );

  const userMessage = `Please analyze this property listing and return your assessment as JSON:

${propertyJson}

Estimated true monthly cost (all-in): $${trueCost.totalMonthly.toLocaleString()}
  - Mortgage: $${trueCost.mortgage.toLocaleString()}
  - Property Tax: $${trueCost.propertyTax.toLocaleString()}
  - Insurance: $${trueCost.insurance.toLocaleString()}
  - HOA: $${trueCost.hoa.toLocaleString()}
  - Maintenance: $${trueCost.maintenance.toLocaleString()}

Return ONLY valid JSON matching the required schema.`;

  const rawText = await llmComplete(
    ANALYSIS_PROMPT,
    [{ role: "user", content: userMessage }],
    1024
  );

  const jsonText = rawText.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  const analysis = JSON.parse(jsonText) as ReportAnalysis;

  return { analysis, trueCost };
}
