import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { users, reports, savedProperties } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

interface Analysis {
  valueVerdict?: "underpriced" | "fair" | "overpriced";
  neighborhoodGrade?: string;
  redFlags?: string[];
  trueCost?: { totalMonthly?: number };
}

interface ScrapedData {
  price?: number;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
}

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}

function VerdictChip({ v }: { v?: string }) {
  if (!v) return <span className="text-[var(--text-muted)] text-xs">—</span>;
  const styles =
    v === "underpriced" ? "bg-green-50 text-green-700 border border-green-200" :
    v === "overpriced"  ? "bg-red-50 text-red-600 border border-red-200" :
                          "bg-yellow-50 text-yellow-700 border border-yellow-200";
  const label = v === "underpriced" ? "↓ Underpriced" : v === "overpriced" ? "↑ Overpriced" : "≈ Fair";
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles}`}>{label}</span>;
}

function ScoreBar({ score }: { score: number | null }) {
  if (score == null) return <span className="text-[var(--text-muted)] text-xs">—</span>;
  const color = score >= 75 ? "#15803D" : score >= 50 ? "#B45309" : "#DC2626";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

export default async function ReportsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user?.email ?? ""),
  });
  if (!user) redirect("/login");

  const allReports = await db
    .select({
      id: reports.id,
      propertyAddress: reports.propertyAddress,
      listingUrl: reports.listingUrl,
      otisScore: reports.otisScore,
      analysis: reports.analysis,
      rawScrapedData: reports.rawScrapedData,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .where(eq(reports.userId, user.id))
    .orderBy(desc(reports.createdAt));

  const savedSet = new Set(
    (await db.select({ reportId: savedProperties.reportId })
      .from(savedProperties)
      .where(eq(savedProperties.userId, user.id))
    ).map((r) => r.reportId)
  );

  // Aggregate stats
  const total = allReports.length;
  const withScores = allReports.filter((r) => r.otisScore != null);
  const avgScore = withScores.length
    ? Math.round(withScores.reduce((s, r) => s + r.otisScore!, 0) / withScores.length)
    : null;

  const verdictCounts = { underpriced: 0, fair: 0, overpriced: 0 };
  for (const r of allReports) {
    const v = (r.analysis as Analysis | null)?.valueVerdict;
    if (v === "underpriced") verdictCounts.underpriced++;
    else if (v === "overpriced") verdictCounts.overpriced++;
    else if (v === "fair") verdictCounts.fair++;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-[var(--font-instrument-serif)]">
            Reports
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            All {total} property analyses · full intelligence record
          </p>
        </div>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Analysis
        </Link>
      </div>

      {/* Summary row */}
      {total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: total, color: "text-[var(--text-primary)]" },
            { label: "Avg Score", value: avgScore ?? "—", color: avgScore && avgScore >= 70 ? "text-green-600" : avgScore && avgScore >= 50 ? "text-yellow-600" : "text-[var(--text-primary)]" },
            { label: "Underpriced", value: verdictCounts.underpriced, color: "text-green-600" },
            { label: "Overpriced", value: verdictCounts.overpriced, color: "text-red-500" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-[var(--border)] rounded-xl px-4 py-3 shadow-[var(--shadow-sm)]">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-semibold">{s.label}</p>
              <p className={`text-xl font-bold mt-1 font-[var(--font-instrument-serif)] ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reports table */}
      {total === 0 ? (
        <div className="bg-white border border-[var(--border)] rounded-xl p-16 text-center shadow-[var(--shadow-sm)]">
          <div className="w-14 h-14 bg-[var(--bg-warm)] rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="font-semibold text-[var(--text-primary)] mb-1">No reports yet</p>
          <p className="text-sm text-[var(--text-muted)] mb-4">Analyze your first property listing to get started.</p>
          <Link href="/analyze" className="inline-flex items-center gap-1.5 bg-[var(--accent)] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[var(--accent-hover)] transition-colors">
            Analyze a property
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-[var(--shadow-sm)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-warm)]">
                  <th className="text-left text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide px-5 py-3.5 w-[40%]">Property</th>
                  <th className="text-left text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide px-4 py-3.5">Score</th>
                  <th className="text-left text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide px-4 py-3.5 hidden md:table-cell">Verdict</th>
                  <th className="text-left text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide px-4 py-3.5 hidden lg:table-cell">Price</th>
                  <th className="text-left text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide px-4 py-3.5 hidden lg:table-cell">Est. Monthly</th>
                  <th className="text-left text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide px-4 py-3.5 hidden sm:table-cell">Date</th>
                  <th className="text-left text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide px-4 py-3.5">Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {allReports.map((r) => {
                  const a = (r.analysis ?? {}) as Analysis;
                  const scraped = (r.rawScrapedData ?? {}) as ScrapedData;
                  const price = scraped.price ?? null;
                  const monthly = a.trueCost?.totalMonthly ?? null;
                  const isSaved = savedSet.has(r.id);

                  return (
                    <tr key={r.id} className="hover:bg-[var(--bg-warm)] transition-colors group">
                      <td className="px-5 py-4">
                        <Link href={`/report/${r.id}`} className="block">
                          <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-1 text-sm">
                            {r.propertyAddress ?? "Unknown address"}
                          </p>
                          {(scraped.beds || scraped.baths || scraped.sqft) && (
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                              {[
                                scraped.beds && `${scraped.beds} bd`,
                                scraped.baths && `${scraped.baths} ba`,
                                scraped.sqft && `${scraped.sqft.toLocaleString()} sqft`,
                              ].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <ScoreBar score={r.otisScore} />
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <VerdictChip v={a.valueVerdict} />
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-[var(--text-primary)] hidden lg:table-cell">
                        {price ? formatPrice(price) : "—"}
                      </td>
                      <td className="px-4 py-4 text-xs text-[var(--text-muted)] hidden lg:table-cell">
                        {monthly ? `${formatPrice(monthly)}/mo` : "—"}
                      </td>
                      <td className="px-4 py-4 text-xs text-[var(--text-muted)] hidden sm:table-cell whitespace-nowrap">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        {isSaved ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                            Saved
                          </span>
                        ) : (
                          <Link href={`/report/${r.id}`} className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors font-medium">
                            View →
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
