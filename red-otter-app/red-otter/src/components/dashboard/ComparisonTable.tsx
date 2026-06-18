import React from "react";

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
  valueVerdict: "underpriced" | "fair" | "overpriced";
  redFlags: string[];
  trueCost: TrueCost;
}

export interface ComparisonProperty {
  reportId: string;
  address: string;
  price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  analysis: Analysis;
}

interface ComparisonTableProps {
  properties: ComparisonProperty[];
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatMonthly(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function verdictBadge(verdict: string): React.ReactNode {
  const styles: Record<string, string> = {
    underpriced: "bg-[var(--success-bg)] text-[var(--success)]",
    fair: "bg-[var(--warning-bg)] text-[var(--warning)]",
    overpriced: "bg-[var(--danger-bg)] text-[var(--danger)]",
  };
  const label: Record<string, string> = {
    underpriced: "Underpriced",
    fair: "Fair",
    overpriced: "Overpriced",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
        styles[verdict] ?? "bg-[var(--bg-muted)] text-[var(--text-muted)]"
      }`}
    >
      {label[verdict] ?? verdict}
    </span>
  );
}

function scoreColor(score: number): string {
  if (score >= 75) return "text-[var(--success)]";
  if (score >= 50) return "text-[var(--warning)]";
  return "text-[var(--danger)]";
}

type RowDef = {
  label: string;
  render: (p: ComparisonProperty) => React.ReactNode;
};

const ROWS: RowDef[] = [
  {
    label: "Price",
    render: (p) =>
      p.price !== null ? formatPrice(p.price) : "—",
  },
  {
    label: "Otis Score",
    render: (p) => (
      <span className={`font-bold ${scoreColor(p.analysis.otisScore)}`}>
        {p.analysis.otisScore}/100
      </span>
    ),
  },
  {
    label: "Beds",
    render: (p) => (p.beds !== null ? String(p.beds) : "—"),
  },
  {
    label: "Baths",
    render: (p) => (p.baths !== null ? String(p.baths) : "—"),
  },
  {
    label: "Sqft",
    render: (p) =>
      p.sqft !== null
        ? new Intl.NumberFormat("en-US").format(p.sqft)
        : "—",
  },
  {
    label: "Monthly Cost",
    render: (p) => formatMonthly(p.analysis.trueCost.totalMonthly),
  },
  {
    label: "Value Verdict",
    render: (p) => verdictBadge(p.analysis.valueVerdict),
  },
  {
    label: "Red Flags",
    render: (p) => (
      <span className={p.analysis.redFlags.length > 0 ? "text-[var(--danger)] font-semibold" : "text-[var(--text-muted)]"}>
        {p.analysis.redFlags.length}
      </span>
    ),
  },
];

export function ComparisonTable({ properties }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] border border-[var(--border)] text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-muted)] w-36">
              &nbsp;
            </th>
            {properties.map((p) => (
              <th
                key={p.reportId}
                className="text-left py-3 px-4 font-semibold text-[var(--text-primary)]"
              >
                <span className="line-clamp-2">{p.address}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => (
            <tr
              key={row.label}
              className={i % 2 === 0 ? "bg-white" : "bg-[var(--bg-page)]"}
            >
              <td className="py-3 px-4 font-medium text-[var(--text-muted)]">
                {row.label}
              </td>
              {properties.map((p) => (
                <td key={p.reportId} className="py-3 px-4 text-[var(--text-primary)]">
                  {row.render(p)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
