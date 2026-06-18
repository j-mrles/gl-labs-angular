import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, otisChatMessages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userMessage, assistantMessage } = body as {
    userMessage?: string;
    assistantMessage?: string;
  };

  if (!userMessage || !assistantMessage) {
    return NextResponse.json(
      { error: "userMessage and assistantMessage are required" },
      { status: 400 }
    );
  }

  await db.insert(otisChatMessages).values([
    { userId: user.id, role: "user", content: userMessage },
    { userId: user.id, role: "assistant", content: assistantMessage },
  ]);

  return NextResponse.json({ ok: true });
}
