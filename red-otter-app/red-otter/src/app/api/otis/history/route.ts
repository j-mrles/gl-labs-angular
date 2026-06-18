import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, otisChatMessages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

async function getUser(email: string) {
  return db.query.users.findFirst({ where: eq(users.email, email) });
}

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUser(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const messages = await db.query.otisChatMessages.findMany({
    where: eq(otisChatMessages.userId, user.id),
    orderBy: [asc(otisChatMessages.createdAt)],
  });

  return NextResponse.json({
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
}

export async function DELETE(_req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUser(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await db.delete(otisChatMessages).where(eq(otisChatMessages.userId, user.id));

  return NextResponse.json({ ok: true });
}
