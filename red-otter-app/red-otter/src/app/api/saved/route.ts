import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, reports, savedProperties } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(): Promise<NextResponse> {
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

  const saved = await db.query.savedProperties.findMany({
    where: eq(savedProperties.userId, user.id),
    orderBy: [desc(savedProperties.createdAt)],
    with: {
      report: true,
    },
  });

  return NextResponse.json({ saved });
}

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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { reportId, notes } = body as { reportId?: string; notes?: string };

  if (!reportId || typeof reportId !== "string") {
    return NextResponse.json({ error: "reportId is required" }, { status: 400 });
  }

  // Verify the report exists and belongs to this user
  const report = await db.query.reports.findFirst({
    where: eq(reports.id, reportId),
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const [inserted] = await db
    .insert(savedProperties)
    .values({
      userId: user.id,
      reportId,
      notes: notes ?? null,
      priceAtSave: typeof report.rawScrapedData === "object" &&
        report.rawScrapedData !== null &&
        "price" in report.rawScrapedData
        ? (report.rawScrapedData as { price?: number }).price ?? null
        : null,
    })
    .returning({ id: savedProperties.id });

  return NextResponse.json({ id: inserted.id }, { status: 201 });
}
