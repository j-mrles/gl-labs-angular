import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { users, subscriptions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  trialing: "bg-blue-100 text-blue-800",
  canceled: "bg-red-100 text-red-800",
  past_due: "bg-yellow-100 text-yellow-800",
  unpaid: "bg-orange-100 text-orange-800",
};

const STATUS_OPTIONS = ["all", "active", "trialing", "canceled", "past_due", "unpaid"] as const;

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const statusFilter = (typeof params.status === "string" ? params.status : "") || "";
  const currentPage = Math.max(1, parseInt(typeof params.page === "string" ? params.page : "1", 10));
  const pageSize = 20;
  const offset = (currentPage - 1) * pageSize;

  // Build where clause
  const whereClause = statusFilter
    ? eq(subscriptions.status, statusFilter as "trialing" | "active" | "past_due" | "canceled" | "unpaid")
    : undefined;

  // Fetch subscriptions joined with users
  const rows = await db
    .select({
      id: subscriptions.id,
      userId: subscriptions.userId,
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      plan: subscriptions.plan,
      status: subscriptions.status,
      currentPeriodStart: subscriptions.currentPeriodStart,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      userEmail: users.email,
      userName: users.name,
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(whereClause)
    .limit(pageSize)
    .offset(offset);

  // Total count (with filter)
  const totalResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(subscriptions)
    .where(whereClause);
  const total = totalResult[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Stats — always unfiltered
  const statsResult = await db
    .select({
      total: sql<number>`COUNT(*)`,
      active: sql<number>`SUM(CASE WHEN ${subscriptions.status} = 'active' THEN 1 ELSE 0 END)`,
      trialing: sql<number>`SUM(CASE WHEN ${subscriptions.status} = 'trialing' THEN 1 ELSE 0 END)`,
      canceled: sql<number>`SUM(CASE WHEN ${subscriptions.status} = 'canceled' THEN 1 ELSE 0 END)`,
    })
    .from(subscriptions);

  const stats = statsResult[0] ?? { total: 0, active: 0, trialing: 0, canceled: 0 };
  const mrr = (stats.active ?? 0) * 24;

  return (
    <div>
      <h1 className="text-2xl font-[var(--font-instrument-serif)] font-bold text-[var(--text-primary)] mb-6">
        Subscriptions
      </h1>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <SummaryCard label="Total Subscriptions" value={String(stats.total ?? 0)} />
        <SummaryCard label="Active" value={String(stats.active ?? 0)} accent="text-green-700" />
        <SummaryCard label="Trialing" value={String(stats.trialing ?? 0)} accent="text-blue-700" />
        <SummaryCard label="Canceled" value={String(stats.canceled ?? 0)} accent="text-red-700" />
        <SummaryCard label="Est. MRR" value={currencyFormatter.format(mrr)} accent="text-green-700" />
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-[var(--text-secondary)]">Filter:</span>
        {STATUS_OPTIONS.map((s) => {
          const isActive = s === "all" ? !statusFilter : statusFilter === s;
          const href = s === "all" ? "/admin/subscriptions" : `/admin/subscriptions?status=${s}`;
          return (
            <Link
              key={s}
              href={href}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-warm)] text-[var(--text-secondary)] hover:bg-[var(--border)]"
              }`}
            >
              {s === "all" ? "All" : s === "past_due" ? "Past Due" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Link>
          );
        })}
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">User</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Status</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Period Start</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Period End</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--text-secondary)]">Stripe</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[var(--text-muted)]">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`border-b border-[var(--border)] last:border-b-0 ${
                      idx % 2 === 0 ? "bg-white" : "bg-[var(--bg-page)]"
                    }`}
                  >
                    <td className="px-4 py-3 text-[var(--text-primary)]">
                      {row.userEmail}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] capitalize">
                      {row.plan}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_STYLES[row.status] ?? "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {row.status === "past_due" ? "Past Due" : row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {row.currentPeriodStart
                        ? dateFormatter.format(row.currentPeriodStart)
                        : "--"}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {row.currentPeriodEnd
                        ? dateFormatter.format(row.currentPeriodEnd)
                        : "--"}
                    </td>
                    <td className="px-4 py-3">
                      {row.stripeSubscriptionId ? (
                        <a
                          href={`https://dashboard.stripe.com/subscriptions/${row.stripeSubscriptionId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent)] hover:underline text-xs font-medium"
                        >
                          View in Stripe
                        </a>
                      ) : (
                        <span className="text-[var(--text-muted)] text-xs">--</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-[var(--text-muted)]">
            Showing {offset + 1}--{Math.min(offset + pageSize, total)} of {total}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/admin/subscriptions?${new URLSearchParams({
                  ...(statusFilter ? { status: statusFilter } : {}),
                  page: String(currentPage - 1),
                }).toString()}`}
                className="px-3 py-1 rounded-[var(--radius-lg)] text-xs font-medium bg-white border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-warm)] transition-colors"
              >
                Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={`/admin/subscriptions?${new URLSearchParams({
                  ...(statusFilter ? { status: statusFilter } : {}),
                  page: String(currentPage + 1),
                }).toString()}`}
                className="px-3 py-1 rounded-[var(--radius-lg)] text-xs font-medium bg-white border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-warm)] transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--border)] px-5 py-4">
      <p className="text-xs font-medium text-[var(--text-muted)] mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ?? "text-[var(--text-primary)]"}`}>{value}</p>
    </div>
  );
}
