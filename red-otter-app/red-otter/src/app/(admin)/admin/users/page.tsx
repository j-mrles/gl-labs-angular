import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { users, reports } from "@/lib/db/schema";
import { like, sql, desc } from "drizzle-orm";
import Link from "next/link";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();

  const { search = "", page = "1" } = await searchParams;
  const searchStr = typeof search === "string" ? search : "";
  const currentPage = Math.max(1, parseInt(typeof page === "string" ? page : "1", 10));
  const pageSize = 20;
  const offset = (currentPage - 1) * pageSize;

  const whereClause = searchStr
    ? like(users.email, `%${searchStr}%`)
    : undefined;

  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      subscriptionStatus: users.subscriptionStatus,
      createdAt: users.createdAt,
      reportCount: sql<number>`(SELECT COUNT(*) FROM reports WHERE reports.user_id = ${users.id})`,
    })
    .from(users)
    .where(whereClause)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(whereClause);

  const total = totalResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>User Management</h1>
        <span style={{ color: "var(--muted-foreground, #6b7280)", fontSize: "0.875rem" }}>
          {total} total user{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/users" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            name="search"
            placeholder="Search by email..."
            defaultValue={searchStr}
            style={{
              flex: 1,
              padding: "0.5rem 0.75rem",
              border: "1px solid var(--border, #e5e7eb)",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              backgroundColor: "var(--background, #fff)",
              color: "var(--foreground, #111)",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "var(--primary, #111)",
              color: "var(--primary-foreground, #fff)",
              border: "none",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Search
          </button>
          {searchStr && (
            <Link
              href="/admin/users"
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid var(--border, #e5e7eb)",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                textDecoration: "none",
                color: "var(--foreground, #111)",
                display: "flex",
                alignItems: "center",
              }}
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Table */}
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid var(--border, #e5e7eb)",
          borderRadius: "0.5rem",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border, #e5e7eb)", backgroundColor: "var(--muted, #f9fafb)" }}>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Name</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Email</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Role</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Status</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>Reports</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--muted-foreground, #6b7280)",
                  }}
                >
                  {searchStr ? "No users match your search." : "No users found."}
                </td>
              </tr>
            ) : (
              allUsers.map((user) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: "1px solid var(--border, #e5e7eb)" }}
                >
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <Link
                      href={`/admin/users/${user.id}`}
                      style={{
                        color: "var(--primary, #111)",
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      {user.name || "—"}
                    </Link>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--muted-foreground, #6b7280)" }}>
                    {user.email}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
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
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
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
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                    {user.reportCount}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--muted-foreground, #6b7280)" }}>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1.5rem",
          }}
        >
          {currentPage > 1 && (
            <Link
              href={`/admin/users?page=${currentPage - 1}${searchStr ? `&search=${encodeURIComponent(searchStr)}` : ""}`}
              style={{
                padding: "0.5rem 0.75rem",
                border: "1px solid var(--border, #e5e7eb)",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                textDecoration: "none",
                color: "var(--foreground, #111)",
              }}
            >
              Previous
            </Link>
          )}
          <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground, #6b7280)" }}>
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/admin/users?page=${currentPage + 1}${searchStr ? `&search=${encodeURIComponent(searchStr)}` : ""}`}
              style={{
                padding: "0.5rem 0.75rem",
                border: "1px solid var(--border, #e5e7eb)",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                textDecoration: "none",
                color: "var(--foreground, #111)",
              }}
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
