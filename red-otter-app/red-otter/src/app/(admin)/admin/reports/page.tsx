import { db } from "@/lib/db";
import { users, reports } from "@/lib/db/schema";
import { eq, like, gte, lte, and, desc, sql } from "drizzle-orm";
import Link from "next/link";

const PAGE_SIZE = 20;

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

interface Analysis {
  _adminFlagged?: boolean;
  [key: string]: unknown;
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const {
    search = "",
    scoreFilter = "all",
    page: pageParam = "1",
  } = await searchParams;

  const searchStr = typeof search === "string" ? search : "";
  const scoreFilterStr = typeof scoreFilter === "string" ? scoreFilter : "all";
  const page = Math.max(1, parseInt(typeof pageParam === "string" ? pageParam : "1", 10));

  // Build where conditions
  const conditions = [];

  if (searchStr) {
    conditions.push(like(reports.propertyAddress, `%${searchStr}%`));
  }

  if (scoreFilterStr === "high") {
    conditions.push(gte(reports.otisScore, 70));
  } else if (scoreFilterStr === "medium") {
    conditions.push(gte(reports.otisScore, 40));
    conditions.push(lte(reports.otisScore, 69));
  } else if (scoreFilterStr === "low") {
    conditions.push(gte(reports.otisScore, 0));
    conditions.push(lte(reports.otisScore, 39));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Stats
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reports);

  const [avgResult] = await db
    .select({ avg: sql<number>`round(avg(otis_score), 1)` })
    .from(reports)
    .where(sql`otis_score is not null`);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [monthResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reports)
    .where(gte(reports.createdAt, startOfMonth));

  // Filtered count
  const [filteredCountResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reports)
    .where(whereClause);

  const total = filteredCountResult.count;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Paginated reports with user email
  const rows = await db
    .select({
      id: reports.id,
      propertyAddress: reports.propertyAddress,
      otisScore: reports.otisScore,
      analysis: reports.analysis,
      createdAt: reports.createdAt,
      userEmail: users.email,
    })
    .from(reports)
    .leftJoin(users, eq(reports.userId, users.id))
    .where(whereClause)
    .orderBy(desc(reports.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  // Build query string helper
  function buildQs(overrides: Record<string, string | number>) {
    const p = new URLSearchParams();
    if (searchStr) p.set("search", searchStr);
    if (scoreFilterStr !== "all") p.set("scoreFilter", scoreFilterStr);
    p.set("page", String(page));
    for (const [k, v] of Object.entries(overrides)) {
      p.set(k, String(v));
    }
    return p.toString();
  }

  const scoreFilters = [
    { value: "all", label: "All Scores" },
    { value: "high", label: "High (70+)" },
    { value: "medium", label: "Medium (40-69)" },
    { value: "low", label: "Low (0-39)" },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold font-[var(--font-instrument-serif)] text-[var(--text-primary)] mb-6">
        Reports
      </h1>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-sm)] border border-[var(--border)]">
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)] mb-1">
            Total Reports
          </p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">
            {totalResult.count}
          </p>
        </div>
        <div className="bg-white rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-sm)] border border-[var(--border)]">
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)] mb-1">
            Average Score
          </p>
          <p className="text-3xl font-bold text-[#15803D]">
            {avgResult.avg ?? "--"}
          </p>
        </div>
        <div className="bg-white rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-sm)] border border-[var(--border)]">
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)] mb-1">
            Reports This Month
          </p>
          <p className="text-3xl font-bold text-[#15803D]">
            {monthResult.count}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <form method="get" className="flex-1">
          <input type="hidden" name="scoreFilter" value={scoreFilterStr} />
          <input type="hidden" name="page" value="1" />
          <input
            type="text"
            name="search"
            placeholder="Search by address..."
            defaultValue={searchStr}
            className="w-full px-4 py-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#15803D]/30 focus:border-[#15803D]"
          />
        </form>

        {/* Score filter pills */}
        <div className="flex gap-1">
          {scoreFilters.map((f) => (
            <Link
              key={f.value}
              href={`/admin/reports?${buildQs({ scoreFilter: f.value, page: 1 })}`}
              className={`px-3 py-2 rounded-[var(--radius-lg)] text-xs font-medium transition-colors ${
                scoreFilterStr === f.value
                  ? "bg-[#15803D]/10 text-[#15803D]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-warm)]"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--border)] overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)]">
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium text-center">Score</th>
              <th className="px-4 py-3 font-medium text-center">Flagged</th>
              <th className="px-4 py-3 font-medium text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-[var(--text-muted)]"
                >
                  No reports found
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const analysis = (row.analysis ?? {}) as Analysis;
                const isFlagged = analysis._adminFlagged === true;

                return (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-warm)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/reports/${row.id}`}
                        className="text-[var(--text-primary)] hover:text-[#15803D] transition-colors font-medium"
                      >
                        {row.propertyAddress ?? "N/A"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {row.userEmail ?? "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.otisScore != null ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                            row.otisScore >= 70
                              ? "bg-[#15803D]/10 text-[#15803D]"
                              : row.otisScore >= 40
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {row.otisScore}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isFlagged ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          Flagged
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--text-muted)]">
                      {row.createdAt ? dateFmt.format(row.createdAt) : "--"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            Showing {(page - 1) * PAGE_SIZE + 1}--
            {Math.min(page * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/reports?${buildQs({ page: page - 1 })}`}
                className="px-3 py-1.5 rounded-[var(--radius-lg)] text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-warm)] transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/reports?${buildQs({ page: page + 1 })}`}
                className="px-3 py-1.5 rounded-[var(--radius-lg)] text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-warm)] transition-colors"
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
