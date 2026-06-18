import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, otisChatMessages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { OtisChat } from "@/components/chat/OtisChat";

export default async function ChatPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user?.email ?? ""),
  });

  if (!user) redirect("/login");

  const dbMessages = await db.query.otisChatMessages.findMany({
    where: eq(otisChatMessages.userId, user.id),
    orderBy: [asc(otisChatMessages.createdAt)],
  });

  const initialMessages = dbMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <OtisChat initialMessages={initialMessages} />
    </div>
  );
}
