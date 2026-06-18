import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, reports, chatMessages } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { chatWithOtis } from "@/lib/otis/chat";
import type { ReportAnalysis } from "@/lib/otis/types";
import type { ChatMessage } from "@/lib/otis/types";

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

  const { reportId, message } = body as { reportId?: string; message?: string };

  if (!reportId || typeof reportId !== "string") {
    return NextResponse.json({ error: "reportId is required" }, { status: 400 });
  }
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  // Verify report belongs to user
  const report = await db.query.reports.findFirst({
    where: and(eq(reports.id, reportId), eq(reports.userId, user.id)),
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // Get chat history
  const dbHistory = await db.query.chatMessages.findMany({
    where: and(
      eq(chatMessages.reportId, reportId),
      eq(chatMessages.userId, user.id)
    ),
    orderBy: [asc(chatMessages.createdAt)],
  });

  // Map DB roles to ChatMessage format expected by chatWithOtis
  const history: ChatMessage[] = dbHistory.map((msg) => ({
    role: msg.role === "otis" ? "assistant" : "user",
    content: msg.content,
  }));

  const reportContext = (report.analysis as ReportAnalysis) ?? null;

  let response: string;
  try {
    response = await chatWithOtis(message, reportContext, history);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Chat failed";
    return NextResponse.json({ error: errorMessage }, { status: 502 });
  }

  // Save user message and Otis response
  await db.insert(chatMessages).values([
    {
      userId: user.id,
      reportId,
      role: "user",
      content: message,
    },
    {
      userId: user.id,
      reportId,
      role: "otis",
      content: response,
    },
  ]);

  return NextResponse.json({ response });
}
