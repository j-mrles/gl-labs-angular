import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, reports, savedProperties } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { llmStream } from "@/lib/llm";
import { buildPortfolioPrompt } from "@/lib/otis/portfolio-prompt";
import type { PortfolioProperty, PortfolioContext } from "@/lib/otis/portfolio-prompt";
import { isOnTopic, sanitizeInput } from "@/lib/otis/guardrails";

const DEFLECTION =
  "I'm built to help you with real estate! Ask me about your portfolio, a specific property, or the home buying process.";

interface Analysis {
  valueVerdict?: "underpriced" | "fair" | "overpriced";
  neighborhoodGrade?: string;
  redFlags?: string[];
  trueCost?: { totalMonthly?: number };
}

interface ScrapedData {
  price?: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  let body: { message?: string; history?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { message, history = [] } = body;
  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: "Message required" }), { status: 400 });
  }

  if (!isOnTopic(message, history.length > 0)) {
    return new Response(DEFLECTION, { headers: { "Content-Type": "text/plain" } });
  }

  const sanitized = sanitizeInput(message);

  // Build portfolio context
  const [allReports, savedRows] = await Promise.all([
    db.query.reports.findMany({
      where: eq(reports.userId, user.id),
      orderBy: [desc(reports.createdAt)],
    }),
    db
      .select({
        reportId: savedProperties.reportId,
        priceAtSave: savedProperties.priceAtSave,
        propertyAddress: reports.propertyAddress,
        rawScrapedData: reports.rawScrapedData,
        otisScore: reports.otisScore,
        analysis: reports.analysis,
      })
      .from(savedProperties)
      .innerJoin(reports, eq(savedProperties.reportId, reports.id))
      .where(eq(savedProperties.userId, user.id))
      .orderBy(desc(savedProperties.createdAt)),
  ]);

  const savedIds = new Set(savedRows.map((r) => r.reportId));

  const scores = allReports.filter((r) => r.otisScore != null).map((r) => r.otisScore!);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const verdictCounts = { underpriced: 0, fair: 0, overpriced: 0 };
  for (const r of allReports) {
    const v = (r.analysis as Analysis | null)?.valueVerdict;
    if (v === "underpriced") verdictCounts.underpriced++;
    else if (v === "overpriced") verdictCounts.overpriced++;
    else if (v === "fair") verdictCounts.fair++;
  }

  function toPortfolioProp(r: typeof allReports[0], saved: boolean): PortfolioProperty {
    const a = (r.analysis ?? {}) as Analysis;
    const scraped = (r.rawScrapedData ?? {}) as ScrapedData;
    return {
      reportId: r.id,
      address: r.propertyAddress ?? "Unknown address",
      price: scraped.price ?? null,
      otisScore: r.otisScore,
      verdict: a.valueVerdict ?? null,
      monthlyEstimate: a.trueCost?.totalMonthly ?? null,
      neighborhoodGrade: a.neighborhoodGrade ?? null,
      redFlags: a.redFlags ?? [],
      saved,
    };
  }

  const savedProperties2: PortfolioProperty[] = savedRows.map((r) => ({
    reportId: r.reportId,
    address: r.propertyAddress ?? "Unknown address",
    price: r.priceAtSave ?? (r.rawScrapedData as ScrapedData | null)?.price ?? null,
    otisScore: r.otisScore,
    verdict: (r.analysis as Analysis | null)?.valueVerdict ?? null,
    monthlyEstimate: (r.analysis as Analysis | null)?.trueCost?.totalMonthly ?? null,
    neighborhoodGrade: (r.analysis as Analysis | null)?.neighborhoodGrade ?? null,
    redFlags: (r.analysis as Analysis | null)?.redFlags ?? [],
    saved: true,
  }));

  const recentUnsaved: PortfolioProperty[] = allReports
    .filter((r) => !savedIds.has(r.id))
    .slice(0, 5)
    .map((r) => toPortfolioProp(r, false));

  const ctx: PortfolioContext = {
    totalAnalyzed: allReports.length,
    totalSaved: savedRows.length,
    avgScore,
    verdictCounts,
    savedProperties: savedProperties2,
    recentUnsaved,
  };

  const systemPrompt = buildPortfolioPrompt(ctx);

  const messages = [
    ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: sanitized },
  ];

  const stream = llmStream(systemPrompt, messages, 1024);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
