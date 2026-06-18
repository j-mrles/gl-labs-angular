import { db } from "@/lib/db";
import { users, reports } from "@/lib/db/schema";
import { sql, desc, eq, or, gte } from "drizzle-orm";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function AdminDashboardPage() {
  // ------ Stats ------
  const [totalUsersResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);

  const [totalReportsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reports);

  const [activeSubsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(
      or(
        eq(users.subscriptionStatus, "active"),
        eq(users.subscriptionStatus, "trialing")
      )
    );

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [reportsThisWeekResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reports)
    .where(gte(reports.createdAt, sevenDaysAgo));

  const stats = [
    {
      label: "Total Users",
      value: totalUsersResult.count,
      accent: false,
    },
    {
      label: "Total Reports",
      value: totalReportsResult.count,
      accent: false,
    },
    {
      label: "Active Subscriptions",
      value: activeSubsResult.count,
      accent: true,
    },
    {
      label: "Reports This Week",
      value: reportsThisWeekResult.count,
      accent: true,
    },
  ];

  // ------ Recent reports (last 10) with user email ------
  const recentReports = await db
    .select({
      id: reports.id,
      propertyAddress: reports.propertyAddress,
      otisScore: reports.otisScore,
      createdAt: reports.createdAt,
      userEmail: users.email,
    })
    .from(reports)
    .leftJoin(users, eq(reports.userId, users.id))
    .orderBy(desc(reports.createdAt))
    .limit(10);

  // ------ Recent signups (last 5) ------
  const recentUsers = await db
    .select({
      id: users.id,
      email: users.email,
      createdAt: users.createdAt,
      subscriptionStatus: users.subscriptionStatus,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(5);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold font-[var(--font-instrument-serif)] text-[var(--text-primary)] mb-6">
        Dashboard
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-sm)] border border-[var(--border)]"
          >
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)] mb-1">
              {stat.label}
            </p>
            <p
              className={`text-3xl font-bold ${
                stat.accent ? "text-[#15803D]" : "text-[var(--text-primary)]"
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
          Recent Activity
        </h2>
        <div className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                <th className="px-4 py-3 font-medium">Address</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium text-center">
                  Otis Score
                </th>
                <th className="px-4 py-3 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-[var(--text-muted)]"
                  >
                    No reports yet
                  </td>
                </tr>
              ) : (
                recentReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-warm)] transition-colors"
                  >
                    <td className="px-4 py-3 text-[var(--text-primary)]">
                      {report.propertyAddress ?? "N/A"}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {report.userEmail ?? "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {report.otisScore != null ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                            report.otisScore >= 70
                              ? "bg-[#15803D]/10 text-[#15803D]"
                              : report.otisScore >= 40
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {report.otisScore}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--text-muted)]">
                      {report.createdAt
                        ? dateFmt.format(report.createdAt)
                        : "--"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Signups */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
          Recent Signups
        </h2>
        <div className="bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--text-muted)]">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Subscription</th>
                <th className="px-4 py-3 font-medium text-right">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-[var(--text-muted)]"
                  >
                    No users yet
                  </td>
                </tr>
              ) : (
                recentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-warm)] transition-colors"
                  >
                    <td className="px-4 py-3 text-[var(--text-primary)]">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          user.subscriptionStatus === "active"
                            ? "bg-[#15803D]/10 text-[#15803D]"
                            : user.subscriptionStatus === "trialing"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-[var(--text-muted)]"
                        }`}
                      >
                        {user.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--text-muted)]">
                      {user.createdAt ? dateFmt.format(user.createdAt) : "--"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
