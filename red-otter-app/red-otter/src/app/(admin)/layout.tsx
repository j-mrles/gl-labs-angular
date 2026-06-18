import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import AdminNav from "./admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-[var(--border)] flex flex-col px-4 py-6">
        {/* Brand */}
        <Link href="/admin" className="mb-8 block">
          <span className="text-xl font-bold tracking-tight font-[var(--font-instrument-serif)] text-[var(--text-primary)]">
            Otis Admin
          </span>
        </Link>

        {/* Navigation */}
        <AdminNav />

        {/* Back to app */}
        <div className="mt-auto pt-6 border-t border-[var(--border)]">
          <Link
            href="/dashboard"
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Back to app
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
