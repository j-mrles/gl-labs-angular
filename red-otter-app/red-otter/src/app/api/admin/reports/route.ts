import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, reports } from "@/lib/db/schema";
import { eq, like, gte, lte, and, desc, sql } from "drizzle-orm";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest): Promise<NextResponse> {
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

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const scoreFilter = searchParams.get("scoreFilter") ?? "all";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  // Build where conditions
  const conditions = [];

  if (search) {
    conditions.push(like(reports.propertyAddress, `%${search}%`));
  }

  if (scoreFilter === "high") {
    conditions.push(gte(reports.otisScore, 70));
  } else if (scoreFilter === "medium") {
    conditions.push(gte(reports.otisScore, 40));
    conditions.push(lte(reports.otisScore, 69));
  } else if (scoreFilter === "low") {
    conditions.push(gte(reports.otisScore, 0));
    conditions.push(lte(reports.otisScore, 39));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reports)
    .where(whereClause);

  const total = countResult.count;

  // Get paginated reports with user email
  const rows = await db
    .select({
      id: reports.id,
      userId: reports.userId,
      listingUrl: reports.listingUrl,
      propertyAddress: reports.propertyAddress,
      otisScore: reports.otisScore,
      analysis: reports.analysis,
      createdAt: reports.createdAt,
      userEmail: users.email,
    })
    .from(reports)
    .leftJoin(users, eq(reports.userId, users.id))
    .where(whereClause)
    .orderBy(desc(reports.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return NextResponse.json({
    reports: rows,
    total,
    page,
    pageSize: PAGE_SIZE,
  });
}
