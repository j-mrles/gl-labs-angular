import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { users, reports, savedProperties } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  ComparisonTable,
  type ComparisonProperty,
} from "@/components/dashboard/ComparisonTable";
import { Button } from "@/components/ui/Button";

interface ScrapedData {
  price?: number;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
}

interface Analysis {
  otisScore: number;
  valueVerdict: "underpriced" | "fair" | "overpriced";
  redFlags: string[];
  trueCost: {
    mortgage: number;
    propertyTax: number;
    insurance: number;
    hoa: number;
    maintenance: number;
    totalMonthly: number;
  };
}

export default async function ComparePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user?.email ?? ""),
  });

  if (!user) redirect("/login");

  const rows = await db
    .select({
      reportId: savedProperties.reportId,
      priceAtSave: savedProperties.priceAtSave,
      propertyAddress: reports.propertyAddress,
      rawScrapedData: reports.rawScrapedData,
      analysis: reports.analysis,
    })
    .from(savedProperties)
    .innerJoin(reports, eq(savedProperties.reportId, reports.id))
    .where(eq(savedProperties.userId, user.id))
    .orderBy(desc(savedProperties.createdAt))
    .limit(3);

  const properties: ComparisonProperty[] = rows.map((row) => {
    const scraped = (row.rawScrapedData ?? {}) as ScrapedData;
    const analysis = row.analysis as Analysis;

    return {
      reportId: row.reportId,
      address: row.propertyAddress ?? "Unknown address",
      price: row.priceAtSave ?? scraped.price ?? null,
      beds: scraped.beds ?? null,
      baths: scraped.baths ?? null,
      sqft: scraped.sqft ?? null,
      analysis,
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-[var(--font-instrument-serif)] font-bold text-[var(--text-primary)]">
            Compare Properties
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Showing your 3 most recently saved properties
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            View All Saved
          </Button>
        </Link>
      </div>

      {properties.length < 2 ? (
        <div className="text-center py-20 bg-white rounded-[var(--radius-xl)] border border-[var(--border)]">
          <p className="text-[var(--text-muted)] text-lg mb-2">
            You need at least 2 saved properties to compare.
          </p>
          <p className="text-[var(--text-muted)] text-sm mb-6">
            Analyze and save more listings to unlock comparison.
          </p>
          <Link href="/analyze">
            <Button className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white">
              Analyze a Property
            </Button>
          </Link>
        </div>
      ) : (
        <ComparisonTable properties={properties} />
      )}
    </div>
  );
}
