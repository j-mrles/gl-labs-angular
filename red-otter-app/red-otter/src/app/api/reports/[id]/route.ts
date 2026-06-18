import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, reports, chatMessages } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

  const { id } = await params;

  const report = await db.query.reports.findFirst({
    where: and(eq(reports.id, id), eq(reports.userId, user.id)),
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const messages = await db.query.chatMessages.findMany({
    where: and(
      eq(chatMessages.reportId, id),
      eq(chatMessages.userId, user.id)
    ),
    orderBy: [asc(chatMessages.createdAt)],
  });

  return NextResponse.json({ report, messages });
}
