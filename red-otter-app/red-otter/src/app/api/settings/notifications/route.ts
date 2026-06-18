import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, notificationPrefs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

  let prefs = await db.query.notificationPrefs.findFirst({
    where: eq(notificationPrefs.userId, user.id),
  });

  // Create defaults if no prefs exist yet
  if (!prefs) {
    const [inserted] = await db
      .insert(notificationPrefs)
      .values({ userId: user.id })
      .returning();
    prefs = inserted;
  }

  return NextResponse.json({
    emailReportReady: prefs.emailReportReady,
    emailWeeklyDigest: prefs.emailWeeklyDigest,
    emailPriceAlerts: prefs.emailPriceAlerts,
  });
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
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

  const { emailReportReady, emailWeeklyDigest, emailPriceAlerts } = body as {
    emailReportReady?: boolean;
    emailWeeklyDigest?: boolean;
    emailPriceAlerts?: boolean;
  };

  // Build update payload — only include fields that were provided
  const updates: Record<string, boolean> = {};
  if (typeof emailReportReady === "boolean") updates.emailReportReady = emailReportReady;
  if (typeof emailWeeklyDigest === "boolean") updates.emailWeeklyDigest = emailWeeklyDigest;
  if (typeof emailPriceAlerts === "boolean") updates.emailPriceAlerts = emailPriceAlerts;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // Upsert: ensure a row exists, then update
  const existing = await db.query.notificationPrefs.findFirst({
    where: eq(notificationPrefs.userId, user.id),
  });

  if (!existing) {
    await db.insert(notificationPrefs).values({ userId: user.id, ...updates });
  } else {
    await db
      .update(notificationPrefs)
      .set(updates)
      .where(eq(notificationPrefs.userId, user.id));
  }

  // Return the updated prefs
  const updated = await db.query.notificationPrefs.findFirst({
    where: eq(notificationPrefs.userId, user.id),
  });

  return NextResponse.json({
    emailReportReady: updated!.emailReportReady,
    emailWeeklyDigest: updated!.emailWeeklyDigest,
    emailPriceAlerts: updated!.emailPriceAlerts,
  });
}
