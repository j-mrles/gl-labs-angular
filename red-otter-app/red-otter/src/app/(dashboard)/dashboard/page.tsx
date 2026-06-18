import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { users, reports, savedProperties } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { QuickAnalyzeBar } from "./QuickAnalyzeBar";

interface Analysis {
  valueVerdict?: "underpriced" | "fair" | "overpriced";
  otisScore?: number;
  redFlags?: string[];
  otisTake?: string;
  trueCost?: { totalMonthly?: number };
}

interface ScrapedData {
  price?: number;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(d));
}

function scoreColor(s: number) {
  if (s >= 75) return "text-[#15803D]";
  if (s >= 50) return "text-[#B45309]";
  return "text-[#DC2626]";
}

function scoreBg(s: number) {
  if (s >= 75) return "bg-[#DCFCE7] text-[#15803D]";
  if (s >= 50) return "bg-[#FEF3C7] text-[#B45309]";
  return "bg-[#FEE2E2] text-[#DC2626]";
}

function verdictBadge(v?: string) {
  if (v === "underpriced") return "bg-[#DCFCE7] text-[#15803D]";
  if (v === "overpriced") return "bg-[#FEE2E2] text-[#DC2626]";
  return "bg-[#FEF3C7] text-[#B45309]";
}

function verdictLabel(v?: string) {
  if (v === "underpriced") return "Underpriced";
  if (v === "overpriced") return "Overpriced";
  return "Fair";
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user?.email ?? ""),
  });
  if (!user) redirect("/login");

  const [allReports, savedRows] = await Promise.all([
    db.query.reports.findMany({
      where: eq(reports.userId, user.id),
      orderBy: [desc(reports.createdAt)],
    }),
    db
      .select({
        savedId: savedProperties.id,
        reportId: savedProperties.reportId,
        priceAtSave: savedProperties.priceAtSave,
        savedAt: savedProperties.createdAt,
        alertEnabled: savedProperties.alertEnabled,
        propertyAddress: reports.propertyAddress,
        rawScrapedData: reports.rawScrapedData,
        otisScore: reports.otisScore,
        analysis: reports.analysis,
        listingUrl: reports.listingUrl,
      })
      .from(savedProperties)
      .innerJoin(reports, eq(savedProperties.reportId, reports.id))
      .where(eq(savedProperties.userId, user.id))
      .orderBy(desc(savedProperties.createdAt)),
  ]);

  // Aggregate stats
  const totalReports = allReports.length;
  const totalSaved = savedRows.length;
  const scores = allReports.filter((r) => r.otisScore != null).map((r) => r.otisScore!);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const bestScore = scores.length > 0 ? Math.max(...scores) : null;

  // Verdict distribution
  const verdicts = { underpriced: 0, fair: 0, overpriced: 0 };
  const allRedFlags: string[] = [];
  for (const r of allReports) {
    const a = r.analysis as Analysis | null;
    const v = a?.valueVerdict;
    if (v === "underpriced") verdicts.underpriced++;
    else if (v === "overpriced") verdicts.overpriced++;
    else if (v === "fair") verdicts.fair++;
    if (a?.redFlags) allRedFlags.push(...a.redFlags);
  }

  // Top common red flags
  const flagCounts: Record<string, number> = {};
  for (const f of allRedFlags) {
    const key = f.toLowerCase().slice(0, 60);
    flagCounts[key] = (flagCounts[key] ?? 0) + 1;
  }
  const topFlags = Object.entries(flagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([flag]) => flag);

  // Best deal from saved
  const bestDeal = savedRows
    .filter((r) => r.otisScore != null)
    .sort((a, b) => (b.otisScore ?? 0) - (a.otisScore ?? 0))[0] ?? null;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-[var(--font-instrument-serif)]">
            {greeting()}, {user.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">{today} · Intelligence Overview</p>
        </div>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Analyze Property
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Analyses",
            value: totalReports,
            sub: totalReports === 1 ? "report generated" : "reports generated",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            ),
            iconBg: "bg-blue-50 text-blue-600",
          },
          {
            label: "Tracked Properties",
            value: totalSaved,
            sub: "saved to portfolio",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            ),
            iconBg: "bg-purple-50 text-purple-600",
          },
          {
            label: "Avg Otis Score",
            value: avgScore !== null ? `${avgScore}` : "—",
            sub: avgScore !== null ? (avgScore >= 70 ? "strong portfolio" : avgScore >= 50 ? "mixed results" : "caution advised") : "no data yet",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            ),
            iconBg: avgScore && avgScore >= 70 ? "bg-green-50 text-green-600" : avgScore && avgScore >= 50 ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-500",
          },
          {
            label: "Best Deal Found",
            value: bestScore !== null ? `${bestScore}/100` : "—",
            sub: bestDeal ? (bestDeal.propertyAddress?.split(",")[0] ?? "Saved property") : "no saved properties",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ),
            iconBg: "bg-amber-50 text-amber-500",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[var(--border)] rounded-xl p-5 shadow-[var(--shadow-sm)]">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">{stat.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)] font-[var(--font-instrument-serif)]">{stat.value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 truncate">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Property Intelligence Board */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Property Portfolio</h2>
            {totalSaved > 0 && (
              <Link href="/compare" className="text-xs text-[var(--accent)] hover:underline font-medium">
                Compare all →
              </Link>
            )}
          </div>

          {savedRows.length === 0 ? (
            <div className="bg-white border border-[var(--border)] rounded-xl p-10 text-center">
              <div className="w-12 h-12 bg-[var(--bg-warm)] rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <p className="text-[var(--text-primary)] font-medium mb-1">No properties tracked yet</p>
              <p className="text-sm text-[var(--text-muted)] mb-4">Analyze a listing and save it to build your portfolio.</p>
              <Link href="/analyze" className="inline-flex items-center gap-1.5 bg-[var(--accent)] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[var(--accent-hover)] transition-colors">
                Analyze your first property
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savedRows.map((row) => {
                const scraped = (row.rawScrapedData ?? {}) as ScrapedData;
                const analysis = (row.analysis ?? {}) as Analysis;
                const price = row.priceAtSave ?? scraped.price ?? null;
                const verdict = analysis.valueVerdict;
                const monthly = analysis.trueCost?.totalMonthly;

                return (
                  <Link key={row.savedId} href={`/report/${row.reportId}`} className="block group">
                    <div className="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-md)] transition-all duration-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {verdict && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${verdictBadge(verdict)}`}>
                                {verdictLabel(verdict)}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-snug group-hover:text-[var(--accent)] transition-colors">
                            {row.propertyAddress ?? "Unknown address"}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                            {scraped.beds && <span>{scraped.beds} bd</span>}
                            {scraped.baths && <span>{scraped.baths} ba</span>}
                            {scraped.sqft && <span>{scraped.sqft.toLocaleString()} sqft</span>}
                            <span>Saved {formatDate(row.savedAt)}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 space-y-1">
                          {price && (
                            <p className="text-base font-bold text-[var(--text-primary)]">{formatPrice(price)}</p>
                          )}
                          {monthly && (
                            <p className="text-[11px] text-[var(--text-muted)]">{formatPrice(monthly)}/mo est.</p>
                          )}
                          {row.otisScore != null && (
                            <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${scoreBg(row.otisScore)}`}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              {row.otisScore}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* All recent analyses (not just saved) */}
          {allReports.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Recent Analyses</h2>
                <Link href="/reports" className="text-xs text-[var(--accent)] hover:underline font-medium">
                  View all {totalReports} →
                </Link>
              </div>
              <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-[var(--shadow-sm)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-warm)]">
                      <th className="text-left text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide px-4 py-3">Property</th>
                      <th className="text-right text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide px-4 py-3">Score</th>
                      <th className="text-right text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {allReports.slice(0, 5).map((r) => {
                      const a = r.analysis as Analysis | null;
                      return (
                        <tr key={r.id} className="hover:bg-[var(--bg-warm)] transition-colors">
                          <td className="px-4 py-3">
                            <Link href={`/report/${r.id}`} className="text-[var(--text-primary)] hover:text-[var(--accent)] font-medium truncate block max-w-[220px]">
                              {r.propertyAddress ?? "Unknown address"}
                            </Link>
                            {a?.valueVerdict && (
                              <span className={`text-[10px] font-semibold ${
                                a.valueVerdict === "underpriced" ? "text-green-600" :
                                a.valueVerdict === "overpriced" ? "text-red-500" : "text-yellow-600"
                              }`}>
                                {verdictLabel(a.valueVerdict)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {r.otisScore != null ? (
                              <span className={`text-sm font-bold ${scoreColor(r.otisScore)}`}>{r.otisScore}</span>
                            ) : (
                              <span className="text-[var(--text-muted)]">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-[var(--text-muted)] hidden sm:table-cell">
                            {formatDate(r.createdAt)}
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

        {/* Right: Sidebar panels */}
        <div className="space-y-5">
          {/* Quick Analyze */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-5 shadow-[var(--shadow-sm)]">
            <h3 className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">Quick Analyze</h3>
            <p className="text-xs text-[var(--text-muted)] mb-3">Paste any Zillow, Redfin, or Realtor.com URL</p>
            <QuickAnalyzeBar />
          </div>

          {/* Market Digest */}
          {totalReports > 0 && (
            <div className="bg-white border border-[var(--border)] rounded-xl p-5 shadow-[var(--shadow-sm)]">
              <h3 className="text-[13px] font-semibold text-[var(--text-primary)] mb-4">Your Market Digest</h3>

              {/* Verdict breakdown */}
              <div className="space-y-2 mb-5">
                <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide font-semibold mb-2">Verdict Distribution</p>
                {(
                  [
                    { label: "Underpriced", count: verdicts.underpriced, color: "bg-green-500" },
                    { label: "Fair Value", count: verdicts.fair, color: "bg-yellow-400" },
                    { label: "Overpriced", count: verdicts.overpriced, color: "bg-red-400" },
                  ] as const
                ).map((v) => {
                  const pct = totalReports > 0 ? Math.round((v.count / totalReports) * 100) : 0;
                  return (
                    <div key={v.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[var(--text-secondary)]">{v.label}</span>
                        <span className="font-semibold text-[var(--text-primary)]">{v.count} <span className="text-[var(--text-muted)] font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${v.color} rounded-full transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Common red flags */}
              {topFlags.length > 0 && (
                <div>
                  <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide font-semibold mb-2">Recurring Red Flags</p>
                  <ul className="space-y-1.5">
                    {topFlags.map((flag) => (
                      <li key={flag} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                        <svg className="mt-0.5 shrink-0 text-[#DC2626]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span className="capitalize leading-snug">{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Activity feed */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-5 shadow-[var(--shadow-sm)]">
            <h3 className="text-[13px] font-semibold text-[var(--text-primary)] mb-4">Recent Activity</h3>
            {allReports.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {allReports.slice(0, 6).map((r) => {
                  const a = r.analysis as Analysis | null;
                  return (
                    <li key={r.id} className="flex items-start gap-3">
                      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                        a?.otisScore && a.otisScore >= 70 ? "bg-green-100 text-green-700" :
                        a?.otisScore && a.otisScore >= 50 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-600"
                      }`}>
                        {a?.otisScore ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/report/${r.id}`} className="text-xs font-medium text-[var(--text-primary)] hover:text-[var(--accent)] line-clamp-1 transition-colors">
                          {r.propertyAddress ?? "Unknown address"}
                        </Link>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{formatDate(r.createdAt)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
