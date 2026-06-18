import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, reports } from "@/lib/db/schema";
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const reportCountResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(reports)
    .where(eq(reports.userId, id));

  const reportCount = reportCountResult[0]?.count ?? 0;

  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      stripeCustomerId: user.stripeCustomerId,
      createdAt: user.createdAt,
    },
    reportCount,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const allowedFields: Record<string, string[]> = {
    role: ["user", "admin"],
    subscriptionStatus: ["trialing", "active", "past_due", "canceled", "none"],
  };

  const updates: Record<string, string> = {};

  for (const [key, allowedValues] of Object.entries(allowedFields)) {
    if (key in body) {
      if (!allowedValues.includes(body[key])) {
        return Response.json(
          { error: `Invalid value for ${key}` },
          { status: 400 }
        );
      }
      updates[key] = body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }

  await db.update(users).set(updates).where(eq(users.id, id));

  const updatedUser = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!updatedUser) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json({
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      subscriptionStatus: updatedUser.subscriptionStatus,
      stripeCustomerId: updatedUser.stripeCustomerId,
      createdAt: updatedUser.createdAt,
    },
  });
}
