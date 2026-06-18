import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { users, reports } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import UserActions from "./UserActions";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) {
    notFound();
  }

  const userReports = await db
    .select({
      id: reports.id,
      propertyAddress: reports.propertyAddress,
      otisScore: reports.otisScore,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .where(eq(reports.userId, id))
    .orderBy(desc(reports.createdAt));

  return (
    <div>
      {/* Back link */}
      <Link
        href="/admin/users"
        style={{
          display: "inline-block",
          marginBottom: "1.5rem",
          fontSize: "0.875rem",
          color: "var(--muted-foreground, #6b7280)",
          textDecoration: "none",
        }}
      >
        &larr; Back to Users
      </Link>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* User Info Card */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid var(--border, #e5e7eb)",
            borderRadius: "0.5rem",
            padding: "1.5rem",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
            {user.name || "Unnamed User"}
          </h1>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground, #6b7280)", marginBottom: "0.25rem" }}>
                Email
              </div>
              <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>{user.email}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground, #6b7280)", marginBottom: "0.25rem" }}>
                Role
              </div>
              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.125rem 0.5rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    backgroundColor: user.role === "admin" ? "#fef3c7" : "#e0e7ff",
                    color: user.role === "admin" ? "#92400e" : "#3730a3",
                  }}
                >
                  {user.role}
                </span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground, #6b7280)", marginBottom: "0.25rem" }}>
                Subscription Status
              </div>
              <div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.125rem 0.5rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    backgroundColor:
                      user.subscriptionStatus === "active"
                        ? "#d1fae5"
                        : user.subscriptionStatus === "trialing"
                        ? "#dbeafe"
                        : "#fee2e2",
                    color:
                      user.subscriptionStatus === "active"
                        ? "#065f46"
                        : user.subscriptionStatus === "trialing"
                        ? "#1e40af"
                        : "#991b1b",
                  }}
                >
                  {user.subscriptionStatus}
                </span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground, #6b7280)", marginBottom: "0.25rem" }}>
                Stripe Customer ID
              </div>
              <div style={{ fontSize: "0.875rem", fontWeight: 500, fontFamily: "monospace" }}>
                {user.stripeCustomerId || "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground, #6b7280)", marginBottom: "0.25rem" }}>
                Joined
              </div>
              <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ borderTop: "1px solid var(--border, #e5e7eb)", paddingTop: "1rem" }}>
            <UserActions
              userId={user.id}
              currentRole={user.role}
              currentStatus={user.subscriptionStatus}
            />
          </div>
        </div>

        {/* Reports Table */}
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid var(--border, #e5e7eb)",
            borderRadius: "0.5rem",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border, #e5e7eb)" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>
              Reports ({userReports.length})
            </h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border, #e5e7eb)", backgroundColor: "var(--muted, #f9fafb)" }}>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Address</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>Otis Score</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {userReports.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: "var(--muted-foreground, #6b7280)",
                    }}
                  >
                    No reports yet.
                  </td>
                </tr>
              ) : (
                userReports.map((report) => (
                  <tr key={report.id} style={{ borderBottom: "1px solid var(--border, #e5e7eb)" }}>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {report.propertyAddress || "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      {report.otisScore != null ? (
                        <span
                          style={{
                            fontWeight: 600,
                            color:
                              report.otisScore >= 80
                                ? "#065f46"
                                : report.otisScore >= 60
                                ? "#92400e"
                                : "#991b1b",
                          }}
                        >
                          {report.otisScore}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--muted-foreground, #6b7280)" }}>
                      {report.createdAt
                        ? new Date(report.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
