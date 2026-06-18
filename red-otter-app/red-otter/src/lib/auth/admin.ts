import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!user || user.role !== "admin") redirect("/dashboard");

  return user;
}

export async function isAdmin(email: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return user?.role === "admin";
}
