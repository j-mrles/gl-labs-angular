import { db } from "@/lib/db";
import { users, reports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FlagButton } from "./FlagButton";

interface Analysis {
  otisScore?: number;
  valueVerdict?: string;
  redFlags?: string[];
  trueCost?: {
    totalMonthly?: number;
  };
  _adminFlagged?: boolean;
  [key: string]: unknown;
}

interface ScrapedData {
  address?: string;
  price?: number;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  [key: string]: unknown;
}

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function AdminReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rows = await db
    .select({
      id: reports.id,
      userId: reports.userId,
      listingUrl: reports.listingUrl,
      propertyAddress: reports.propertyAddress,
      rawScrapedData: reports.rawScrapedData,
      otisScore: reports.otisScore,
      analysis: reports.analysis,
      createdAt: reports.createdAt,
      userEmail: users.email,
      userName: users.name,
    })
    .from(reports)
    .leftJoin(users, eq(reports.userId, users.id))
    .where(eq(reports.id, id))
    .limit(1);

  if (rows.length === 0) {
    notFound();
  }

  const report = rows[0];
  const scraped = (report.rawScrapedData ?? {}) as ScrapedData;
  const analysis = (report.analysis ?? {}) as Analysis;
  const isFlagged = analysis._adminFlagged === true;

  return (
    <div className="max-w-4xl">
      {/* Back link */}
      <Link
        href="/admin/reports"
        className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-6"
      >
        &larr; Back to Reports
      </Link>

      {/* Header */}
      <div className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--border)] p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-[var(--font-instrument-serif)] text-[var(--text-primary)] mb-1">
              {report.propertyAddress ?? scraped.address ?? "Unknown Address"}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Report created{" "}
              {report.createdAt ? dateFmt.format(report.createdAt) : "unknown"}{" "}
              by{" "}
              <span className="text-[var(--text-secondary)]">
                {report.userEmail ?? "Unknown user"}
              </span>
            </p>
          </div>

          {/* Flag button */}
          <FlagButton reportId={report.id} initialFlagged={isFlagged} />
        </div>

        {/* Property details */}
        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-[var(--border)]">
          {scraped.price != null && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Price</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                {currencyFmt.format(scraped.price)}
              </p>
            </div>
          )}
          {scraped.beds != null && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Beds</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">{scraped.beds}</p>
            </div>
          )}
          {scraped.baths != null && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Baths</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">{scraped.baths}</p>
            </div>
          )}
          {scraped.sqft != null && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Sq Ft</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                {scraped.sqft.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Analysis summary */}
      <div className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--border)] p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Analysis Summary
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Otis Score */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)] mb-1">
              Otis Score
            </p>
            {report.otisScore != null ? (
              <span
                className={`inline-block text-2xl font-bold ${
                  report.otisScore >= 70
                    ? "text-[#15803D]"
                    : report.otisScore >= 40
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {report.otisScore}
              </span>
            ) : (
              <span className="text-[var(--text-muted)] text-2xl">--</span>
            )}
          </div>

          {/* Value Verdict */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)] mb-1">
              Verdict
            </p>
            {analysis.valueVerdict ? (
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                  analysis.valueVerdict === "underpriced"
                    ? "bg-[#15803D]/10 text-[#15803D]"
                    : analysis.valueVerdict === "fair"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {analysis.valueVerdict}
              </span>
            ) : (
              <span className="text-[var(--text-muted)]">--</span>
            )}
          </div>

          {/* Red Flags */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)] mb-1">
              Red Flags
            </p>
            <span
              className={`text-2xl font-bold ${
                (analysis.redFlags?.length ?? 0) > 0
                  ? "text-red-600"
                  : "text-[var(--text-primary)]"
              }`}
            >
              {analysis.redFlags?.length ?? 0}
            </span>
          </div>

          {/* Monthly Cost */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)] mb-1">
              True Cost/mo
            </p>
            <span className="text-2xl font-bold text-[var(--text-primary)]">
              {analysis.trueCost?.totalMonthly != null
                ? currencyFmt.format(analysis.trueCost.totalMonthly)
                : "--"}
            </span>
          </div>
        </div>

        {/* Red flags list */}
        {analysis.redFlags && analysis.redFlags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <p className="text-sm font-medium text-red-700 mb-2">Red Flags:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-secondary)]">
              {analysis.redFlags.map((flag, i) => (
                <li key={i}>{flag}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Listing URL */}
      {report.listingUrl && (
        <div className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--border)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Listing URL
          </h2>
          <a
            href={report.listingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#15803D] hover:underline break-all"
          >
            {report.listingUrl}
          </a>
        </div>
      )}
    </div>
  );
}
