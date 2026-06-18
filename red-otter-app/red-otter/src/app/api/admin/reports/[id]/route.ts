import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, reports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!adminUser || adminUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const rows = await db
    .select({
      id: reports.id,
      userId: reports.userId,
      listingUrl: reports.listingUrl,
      propertyAddress: reports.propertyAddress,
      rawScrapedData: reports.rawScrapedData,
      otisScore: reports.otisScore,
      analysis: reports.analysis,
      createdAt: reports.createdAt,
      userEmail: users.email,
      userName: users.name,
    })
    .from(reports)
    .leftJoin(users, eq(reports.userId, users.id))
    .where(eq(reports.id, id))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  return NextResponse.json({ report: rows[0] });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!adminUser || adminUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const report = await db.query.reports.findFirst({
    where: eq(reports.id, id),
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const body = await req.json();
  const flagged = Boolean(body.flagged);

  // Store flag in the analysis JSON to avoid schema changes
  const existingAnalysis =
    (report.analysis as Record<string, unknown>) ?? {};
  const updatedAnalysis = { ...existingAnalysis, _adminFlagged: flagged };

  await db
    .update(reports)
    .set({ analysis: updatedAnalysis })
    .where(eq(reports.id, id));

  return NextResponse.json({ success: true, flagged });
}
