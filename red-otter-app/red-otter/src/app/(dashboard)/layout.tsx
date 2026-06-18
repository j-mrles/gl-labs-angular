import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { OtisSidebar } from "@/components/dashboard/OtisSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user?.email ?? ""),
  });

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-[var(--bg-page)]">
      <SidebarNav
        userEmail={user.email}
        userName={user.name}
        isAdmin={user.role === "admin"}
      />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
      <OtisSidebar />
    </div>
  );
}
