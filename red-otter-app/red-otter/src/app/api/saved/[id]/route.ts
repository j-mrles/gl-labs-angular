import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, savedProperties } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
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

  const existing = await db.query.savedProperties.findFirst({
    where: and(eq(savedProperties.id, id), eq(savedProperties.userId, user.id)),
  });

  if (!existing) {
    return NextResponse.json({ error: "Saved property not found" }, { status: 404 });
  }

  await db
    .delete(savedProperties)
    .where(and(eq(savedProperties.id, id), eq(savedProperties.userId, user.id)));

  return NextResponse.json({ success: true });
}
