import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, reports } from "@/lib/db/schema";
import { eq, like, sql, desc } from "drizzle-orm";

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
  const search = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const whereClause = search
    ? like(users.email, `%${search}%`)
    : undefined;

  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      subscriptionStatus: users.subscriptionStatus,
      createdAt: users.createdAt,
      reportCount: sql<number>`(SELECT COUNT(*) FROM reports WHERE reports.user_id = ${users.id})`,
    })
    .from(users)
    .where(whereClause)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(whereClause);

  const total = totalResult[0]?.count ?? 0;

  return Response.json({
    users: allUsers,
    total,
    page,
    pageSize,
  });
}
