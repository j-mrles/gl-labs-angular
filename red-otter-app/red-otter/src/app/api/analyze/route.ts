import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, reports } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { scrapeListingUrl } from "@/lib/scraper";
import { analyzeProperty } from "@/lib/otis/analyze";

const TRIAL_REPORT_LIMIT = 10;

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check subscription status
  const isTrialing =
    user.subscriptionStatus === "trialing" &&
    user.trialEndsAt != null &&
    user.trialEndsAt > new Date();
  const isActive = user.subscriptionStatus === "active";

  if (!isTrialing && !isActive) {
    return NextResponse.json(
      { error: "Subscription required" },
      { status: 403 }
    );
  }

  // Check trial report limit
  if (isTrialing && user.trialReportsUsed >= TRIAL_REPORT_LIMIT) {
    return NextResponse.json(
      { error: "Trial report limit reached" },
      { status: 403 }
    );
  }

  // Validate input
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { url } = body as { url?: string };
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const normalizedUrl = parsedUrl.toString();

  // Check 24-hour cache (same URL + user)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const cached = await db.query.reports.findFirst({
    where: and(
      eq(reports.userId, user.id),
      eq(reports.listingUrl, normalizedUrl),
      gt(reports.createdAt, oneDayAgo)
    ),
  });

  if (cached) {
    return NextResponse.json({ reportId: cached.id });
  }

  // Scrape and analyze
  let propertyData;
  try {
    propertyData = await scrapeListingUrl(normalizedUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scraping failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  let analysis;
  try {
    const result = await analyzeProperty(propertyData);
    analysis = result.analysis;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // Insert report
  const [inserted] = await db
    .insert(reports)
    .values({
      userId: user.id,
      listingUrl: normalizedUrl,
      propertyAddress: propertyData.address ?? null,
      rawScrapedData: propertyData,
      otisScore: analysis.otisScore,
      analysis,
    })
    .returning({ id: reports.id });

  // Increment trial usage
  if (isTrialing) {
    await db
      .update(users)
      .set({ trialReportsUsed: user.trialReportsUsed + 1 })
      .where(eq(users.id, user.id));
  }

  return NextResponse.json({ reportId: inserted.id });
}
