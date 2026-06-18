import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, reports, savedProperties, chatMessages } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { ReportCard } from "@/components/report/ReportCard";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { SaveButton } from "./SaveButton";

interface Analysis {
  otisScore: number;
  valueSummary: string;
  valueVerdict: "underpriced" | "fair" | "overpriced";
  neighborhoodGrade: string;
  neighborhoodSummary: string;
  redFlags: string[];
  negotiationTips: string[];
  otisTake: string;
  trueCost: {
    mortgage: number;
    propertyTax: number;
    insurance: number;
    hoa: number;
    maintenance: number;
    totalMonthly: number;
  };
}

interface ScrapedData {
  address?: string;
  price?: number;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user?.email ?? ""),
  });

  if (!user) redirect("/login");

  const report = await db.query.reports.findFirst({
    where: and(eq(reports.id, id), eq(reports.userId, user.id)),
  });

  if (!report) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--text-muted)] text-lg">Report not found.</p>
      </div>
    );
  }

  const messages = await db.query.chatMessages.findMany({
    where: and(
      eq(chatMessages.reportId, id),
      eq(chatMessages.userId, user.id)
    ),
    orderBy: [asc(chatMessages.createdAt)],
  });

  const saved = await db.query.savedProperties.findFirst({
    where: and(
      eq(savedProperties.reportId, id),
      eq(savedProperties.userId, user.id)
    ),
  });

  const scraped = (report.rawScrapedData ?? {}) as ScrapedData;
  const analysis = report.analysis as Analysis;

  const initialMessages = messages.map((m) => ({
    role: m.role as "user" | "otis",
    content: m.content,
  }));

  return (
    <div className="space-y-6">
      {/* Save button row */}
      <div className="flex justify-end">
        <SaveButton
          reportId={report.id}
          initialSavedId={saved?.id ?? null}
        />
      </div>

      {/* Report card */}
      <ReportCard
        address={report.propertyAddress ?? scraped.address ?? "Unknown address"}
        price={scraped.price ?? 0}
        beds={scraped.beds ?? null}
        baths={scraped.baths ?? null}
        sqft={scraped.sqft ?? null}
        analysis={analysis}
      />

      {/* Chat panel */}
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
          Ask Otis about this property
        </h2>
        <ChatPanel reportId={report.id} initialMessages={initialMessages} />
      </div>
    </div>
  );
}
