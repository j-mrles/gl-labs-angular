"use client";

import { useState } from "react";

interface UserActionsProps {
  userId: string;
  currentRole: string;
  currentStatus: string;
}

export default function UserActions({ userId, currentRole, currentStatus }: UserActionsProps) {
  const [role, setRole] = useState(currentRole);
  const [status, setStatus] = useState(currentStatus);
  const [loadingRole, setLoadingRole] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleRole() {
    const newRole = role === "admin" ? "user" : "admin";
    const confirmed = confirm(
      `Are you sure you want to change this user's role to "${newRole}"?`
    );
    if (!confirmed) return;

    setLoadingRole(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }

      const data = await res.json();
      setRole(data.user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setLoadingRole(false);
    }
  }

  async function toggleStatus() {
    const newStatus = status === "active" ? "none" : "active";
    const action = newStatus === "none" ? "suspend" : "activate";
    const confirmed = confirm(
      `Are you sure you want to ${action} this user's subscription?`
    );
    if (!confirmed) return;

    setLoadingStatus(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionStatus: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      const data = await res.json();
      setStatus(data.user.subscriptionStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setLoadingStatus(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.25rem" }}>Actions</h3>

      {error && (
        <div
          style={{
            padding: "0.5rem 0.75rem",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button
          onClick={toggleRole}
          disabled={loadingRole}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: role === "admin" ? "#fef3c7" : "#e0e7ff",
            color: role === "admin" ? "#92400e" : "#3730a3",
            border: `1px solid ${role === "admin" ? "#fcd34d" : "#a5b4fc"}`,
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: loadingRole ? "not-allowed" : "pointer",
            opacity: loadingRole ? 0.6 : 1,
          }}
        >
          {loadingRole
            ? "Updating..."
            : role === "admin"
            ? "Demote to User"
            : "Promote to Admin"}
        </button>

        <button
          onClick={toggleStatus}
          disabled={loadingStatus}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: status === "active" ? "#fee2e2" : "#d1fae5",
            color: status === "active" ? "#991b1b" : "#065f46",
            border: `1px solid ${status === "active" ? "#fca5a5" : "#6ee7b7"}`,
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: loadingStatus ? "not-allowed" : "pointer",
            opacity: loadingStatus ? 0.6 : 1,
          }}
        >
          {loadingStatus
            ? "Updating..."
            : status === "active"
            ? "Suspend Subscription"
            : "Activate Subscription"}
        </button>
      </div>
    </div>
  );
}
