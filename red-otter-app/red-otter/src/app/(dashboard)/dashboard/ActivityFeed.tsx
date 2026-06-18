import { db } from "@/lib/db";
import { reports, savedProperties } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

interface ActivityFeedProps {
  userId: string;
}

export async function ActivityFeed({ userId }: ActivityFeedProps) {
  const [recentReports, recentSaved] = await Promise.all([
    db.query.reports.findMany({
      where: eq(reports.userId, userId),
      orderBy: [desc(reports.createdAt)],
      limit: 10,
    }),
    db
      .select({
        id: savedProperties.id,
        createdAt: savedProperties.createdAt,
        propertyAddress: reports.propertyAddress,
      })
      .from(savedProperties)
      .innerJoin(reports, eq(savedProperties.reportId, reports.id))
      .where(eq(savedProperties.userId, userId))
      .orderBy(desc(savedProperties.createdAt))
      .limit(5),
  ]);

  // Merge into a single timeline
  type TimelineItem = {
    id: string;
    type: "report" | "saved";
    address: string;
    score?: number | null;
    date: Date;
  };

  const items: TimelineItem[] = [
    ...recentReports.map((r) => ({
      id: r.id,
      type: "report" as const,
      address: r.propertyAddress ?? "Unknown address",
      score: r.otisScore,
      date: r.createdAt,
    })),
    ...recentSaved.map((s) => ({
      id: s.id,
      type: "saved" as const,
      address: s.propertyAddress ?? "Unknown address",
      date: s.createdAt,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const totalReports = recentReports.length;

  if (items.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-[var(--radius-xl)] border border-[var(--border)]">
        <p className="text-[var(--text-muted)] text-sm">
          No activity yet. Analyze a property to get started.
        </p>
      </div>
    );
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-sm)] p-6">
      {/* Summary */}
      <div className="flex items-center gap-2 mb-5">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-sm font-bold">
          {totalReports}
        </span>
        <span className="text-sm text-[var(--text-secondary)]">
          {totalReports === 1 ? "report" : "reports"} generated
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[var(--border)]" />

        <ul className="space-y-4">
          {items.slice(0, 10).map((item) => (
            <li key={`${item.type}-${item.id}`} className="relative flex gap-4 items-start">
              {/* Icon dot */}
              <div
                className={`
                  relative z-10 flex items-center justify-center w-[30px] h-[30px] rounded-full shrink-0
                  ${item.type === "report"
                    ? "bg-[var(--accent-light)] text-[var(--accent)]"
                    : "bg-[var(--info-bg)] text-[var(--info)]"
                  }
                `}
              >
                {item.type === "report" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm text-[var(--text-primary)] truncate">
                  {item.type === "report" ? "Analyzed" : "Saved"}{" "}
                  <span className="font-medium">{item.address}</span>
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[var(--text-muted)]">
                    {formatDate(item.date)}
                  </span>
                  {item.type === "report" && item.score != null && (
                    <span className="text-xs font-medium text-[var(--accent)]">
                      Score: {item.score}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
