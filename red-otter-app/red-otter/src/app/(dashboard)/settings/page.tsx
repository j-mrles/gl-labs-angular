import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-user";
import { ProfileForm } from "./ProfileForm";
import { PasswordForm } from "./PasswordForm";
import { BillingSection } from "./BillingSection";
import { NotificationPrefs } from "./NotificationPrefs";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  const trialEndDate = user.trialEndsAt
    ? new Date(user.trialEndsAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const statusLabels: Record<string, string> = {
    trialing: "Free Trial",
    active: "Active",
    past_due: "Past Due",
    canceled: "Canceled",
    none: "No Plan",
  };

  const planLabel = statusLabels[user.subscriptionStatus] ?? user.subscriptionStatus;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-[var(--font-instrument-serif)] font-bold text-[var(--text-primary)]">
        Settings
      </h1>

      {/* Account Info */}
      <section className="bg-white rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-sm)] p-6">
        <h2 className="text-lg font-[var(--font-instrument-serif)] font-semibold text-[var(--text-primary)] mb-4">
          Account
        </h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--text-muted)]">Email</dt>
            <dd className="text-[var(--text-primary)] font-medium">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--text-muted)]">Name</dt>
            <dd className="text-[var(--text-primary)] font-medium">{user.name ?? "Not set"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--text-muted)]">Member since</dt>
            <dd className="text-[var(--text-primary)] font-medium">{memberSince}</dd>
          </div>
        </dl>
      </section>

      {/* Subscription */}
      <section className="bg-white rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-sm)] p-6">
        <h2 className="text-lg font-[var(--font-instrument-serif)] font-semibold text-[var(--text-primary)] mb-4">
          Subscription
        </h2>
        <dl className="space-y-3 text-sm mb-4">
          <div className="flex justify-between">
            <dt className="text-[var(--text-muted)]">Plan</dt>
            <dd className="text-[var(--text-primary)] font-medium">{planLabel}</dd>
          </div>
          {user.subscriptionStatus === "trialing" && trialEndDate && (
            <div className="flex justify-between">
              <dt className="text-[var(--text-muted)]">Trial ends</dt>
              <dd className="text-[var(--text-primary)] font-medium">{trialEndDate}</dd>
            </div>
          )}
          {user.subscriptionStatus === "trialing" && (
            <div className="flex justify-between">
              <dt className="text-[var(--text-muted)]">Trial reports used</dt>
              <dd className="text-[var(--text-primary)] font-medium">{user.trialReportsUsed}</dd>
            </div>
          )}
        </dl>

        <BillingSection hasStripeCustomer={!!user.stripeCustomerId} />
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-sm)] p-6">
        <h2 className="text-lg font-[var(--font-instrument-serif)] font-semibold text-[var(--text-primary)] mb-4">
          Notifications
        </h2>
        <NotificationPrefs />
      </section>

      {/* Profile */}
      <section className="bg-white rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-sm)] p-6">
        <h2 className="text-lg font-[var(--font-instrument-serif)] font-semibold text-[var(--text-primary)] mb-4">
          Profile
        </h2>
        <ProfileForm initialName={user.name ?? ""} />
      </section>

      {/* Password — only show for credential users */}
      {user.passwordHash && (
        <section className="bg-white rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-sm)] p-6">
          <h2 className="text-lg font-[var(--font-instrument-serif)] font-semibold text-[var(--text-primary)] mb-4">
            Change Password
          </h2>
          <PasswordForm />
        </section>
      )}
    </div>
  );
}
