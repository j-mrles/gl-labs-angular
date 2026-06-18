import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, subscriptions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const whereClause = status
    ? eq(subscriptions.status, status as "trialing" | "active" | "past_due" | "canceled" | "unpaid")
    : undefined;

  const rows = await db
    .select({
      id: subscriptions.id,
      userId: subscriptions.userId,
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      plan: subscriptions.plan,
      status: subscriptions.status,
      currentPeriodStart: subscriptions.currentPeriodStart,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      userEmail: users.email,
      userName: users.name,
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(whereClause)
    .limit(pageSize)
    .offset(offset);

  const totalResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(subscriptions)
    .where(whereClause);

  const total = totalResult[0]?.count ?? 0;

  // Stats — always unfiltered
  const statsResult = await db
    .select({
      total: sql<number>`COUNT(*)`,
      active: sql<number>`SUM(CASE WHEN ${subscriptions.status} = 'active' THEN 1 ELSE 0 END)`,
      trialing: sql<number>`SUM(CASE WHEN ${subscriptions.status} = 'trialing' THEN 1 ELSE 0 END)`,
      canceled: sql<number>`SUM(CASE WHEN ${subscriptions.status} = 'canceled' THEN 1 ELSE 0 END)`,
    })
    .from(subscriptions);

  const stats = statsResult[0] ?? { total: 0, active: 0, trialing: 0, canceled: 0 };
  const mrr = (stats.active ?? 0) * 24;

  return Response.json({
    subscriptions: rows,
    total,
    page,
    pageSize,
    stats: {
      total: stats.total ?? 0,
      active: stats.active ?? 0,
      trialing: stats.trialing ?? 0,
      canceled: stats.canceled ?? 0,
      mrr,
    },
  });
}
