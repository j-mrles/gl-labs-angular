import React from "react";
import { OtisScore } from "./OtisScore";
import { ValueAnalysis } from "./ValueAnalysis";
import { CostBreakdown } from "./CostBreakdown";
import { RedFlags } from "./RedFlags";
import { NegotiationTips } from "./NegotiationTips";
import { OtisTake } from "./OtisTake";

interface TrueCost {
  mortgage: number;
  propertyTax: number;
  insurance: number;
  hoa: number;
  maintenance: number;
  totalMonthly: number;
}

interface Analysis {
  otisScore: number;
  valueSummary: string;
  valueVerdict: "underpriced" | "fair" | "overpriced";
  neighborhoodGrade: string;
  neighborhoodSummary: string;
  redFlags: string[];
  negotiationTips: string[];
  otisTake: string;
  trueCost: TrueCost;
}

export interface ReportCardProps {
  address: string;
  price: number;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  analysis: Analysis;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatSqft(sqft: number): string {
  return new Intl.NumberFormat("en-US").format(sqft);
}

interface StatChipProps {
  label: string;
  value: string;
}

function StatChip({ label, value }: StatChipProps) {
  return (
    <span className="flex items-center gap-1 text-[var(--text-secondary)] text-sm">
      <span className="font-semibold text-[var(--text-primary)]">{value}</span>
      <span>{label}</span>
    </span>
  );
}

export function ReportCard({
  address,
  price,
  beds,
  baths,
  sqft,
  analysis,
}: ReportCardProps) {
  const {
    otisScore,
    valueSummary,
    valueVerdict,
    neighborhoodGrade,
    neighborhoodSummary,
    redFlags,
    negotiationTips,
    otisTake,
    trueCost,
  } = analysis;

  return (
    <div className="min-h-screen bg-[var(--bg-page)] py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* -- 1. Header ------------------------------------------------- */}
        <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] border border-[var(--border)] p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[var(--accent)] uppercase tracking-wide mb-1">
                Property Report
              </p>
              <h1 className="text-2xl font-[var(--font-instrument-serif)] font-bold text-[var(--text-primary)] leading-tight">
                {address}
              </h1>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 divide-x divide-[var(--border)]">
                {beds !== null && (
                  <StatChip value={String(beds)} label="beds" />
                )}
                {baths !== null && (
                  <span className="pl-4">
                    <StatChip value={String(baths)} label="baths" />
                  </span>
                )}
                {sqft !== null && (
                  <span className="pl-4">
                    <StatChip value={formatSqft(sqft)} label="sqft" />
                  </span>
                )}
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-3xl font-bold text-[var(--text-primary)]">
                {formatPrice(price)}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Listed price</p>
            </div>
          </div>
        </div>

        {/* -- 2. OtisScore + ValueAnalysis ------------------------------ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OtisScore score={otisScore} />
          <ValueAnalysis
            valueSummary={valueSummary}
            valueVerdict={valueVerdict}
            neighborhoodGrade={neighborhoodGrade}
            neighborhoodSummary={neighborhoodSummary}
          />
        </div>

        {/* -- 3. CostBreakdown + Neighborhood --------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CostBreakdown trueCost={trueCost} />

          {/* Neighborhood detail card */}
          <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              Neighborhood
            </h2>
            <div className="flex items-center justify-center mb-4">
              <div className="text-6xl font-[var(--font-instrument-serif)] font-bold text-[var(--text-primary)]">
                {neighborhoodGrade}
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {neighborhoodSummary}
            </p>
          </div>
        </div>

        {/* -- 4. RedFlags + NegotiationTips ----------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RedFlags redFlags={redFlags} />
          <NegotiationTips tips={negotiationTips} />
        </div>

        {/* -- 5. OtisTake (full width) ---------------------------------- */}
        <OtisTake otisTake={otisTake} />
      </div>
    </div>
  );
}
