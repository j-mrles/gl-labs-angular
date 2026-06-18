const INJECTION_PATTERNS = [
  /ignore\s+instructions/i,
  /you\s+are\s+now/i,
  /system\s*:/i,
  /reveal\s+prompt/i,
  /forget\s+previous/i,
  /disregard/i,
  /jailbreak/i,
  /pretend\s+you\s+are/i,
  /act\s+as\s+if/i,
  /override\s+your/i,
];

const REAL_ESTATE_KEYWORDS = [
  "house",
  "home",
  "property",
  "properties",
  "portfolio",
  "condo",
  "apartment",
  "townhouse",
  "listing",
  "mortgage",
  "loan",
  "down payment",
  "interest rate",
  "hoa",
  "homeowners",
  "neighborhood",
  "school district",
  "offer",
  "bid",
  "closing",
  "escrow",
  "appraisal",
  "inspection",
  "realtor",
  "agent",
  "mls",
  "zillow",
  "redfin",
  "rent",
  "lease",
  "sqft",
  "square feet",
  "bedroom",
  "bathroom",
  "garage",
  "backyard",
  "lot",
  "zoning",
  "title",
  "deed",
  "equity",
  "refinance",
  "price",
  "market",
  "buy a home",
  "buy a house",
  "buying a home",
  "buying a house",
  "sell a home",
  "sell a house",
  "selling a home",
  "selling a house",
  "invest in real estate",
  "real estate",
  "property tax",
  "insurance",
  "maintenance",
  "overpriced",
  "underpriced",
  "fair value",
  "negotiate",
  "contingency",
  "pre-approval",
  "preapproval",
  "comps",
  "comparable",
  "deal",
  "deals",
  "saved",
  "analyze",
  "analysis",
  "score",
  "red flag",
  "red flags",
  "walk away",
  "compare",
  "address",
  "city",
  "zip",
];

const GREETING_PATTERNS = [
  /^h(i|ey|ello|owdy)[!.,?]?\s*$/i,
  /^(sup|yo|what'?s up|good (morning|afternoon|evening))[!.,?]?\s*$/i,
  /^(who are you|what (are|can) you do|introduce yourself|tell me about yourself)[?.]?\s*$/i,
  /^(what is otis|what's otis)[?.]?\s*$/i,
];

export function isOnTopic(input: string, hasHistory = false): boolean {
  const lower = input.toLowerCase().trim();

  // Check injection patterns first — always reject
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(lower)) {
      return false;
    }
  }

  // Always allow greetings and intro questions so Otis can introduce itself
  for (const pattern of GREETING_PATTERNS) {
    if (pattern.test(lower)) {
      return true;
    }
  }

  // If this is a follow-up in an ongoing conversation, allow short/conversational messages
  if (hasHistory && input.trim().length < 120) {
    return true;
  }

  // Check for real estate keywords
  for (const keyword of REAL_ESTATE_KEYWORDS) {
    if (lower.includes(keyword)) {
      return true;
    }
  }

  return false;
}

export function sanitizeInput(input: string): string {
  // Strip control characters (ASCII 0-31 and 127, except tab/newline/CR which are harmless)
  // eslint-disable-next-line no-control-regex
  const stripped = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Trim whitespace
  const trimmed = stripped.trim();

  // Limit to 2000 chars
  return trimmed.slice(0, 2000);
}
