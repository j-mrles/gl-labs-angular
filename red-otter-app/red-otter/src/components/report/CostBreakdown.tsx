import React from "react";
import { Card } from "@/components/ui/Card";

interface TrueCost {
  mortgage: number;
  propertyTax: number;
  insurance: number;
  hoa: number;
  maintenance: number;
  totalMonthly: number;
}

interface CostBreakdownProps {
  trueCost: TrueCost;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

const lineItems: { key: keyof Omit<TrueCost, "totalMonthly">; label: string }[] =
  [
    { key: "mortgage", label: "Mortgage (P&I)" },
    { key: "propertyTax", label: "Property Tax" },
    { key: "insurance", label: "Homeowner's Insurance" },
    { key: "hoa", label: "HOA Fees" },
    { key: "maintenance", label: "Maintenance Reserve" },
  ];

export function CostBreakdown({ trueCost }: CostBreakdownProps) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        True Monthly Cost
      </h2>

      <div className="space-y-2">
        {lineItems.map(({ key, label }) => (
          <div key={key} className="flex justify-between items-center py-1.5">
            <span className="text-sm text-[var(--text-secondary)]">{label}</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {trueCost[key] > 0 ? formatCurrency(trueCost[key]) : "\u2014"}
            </span>
          </div>
        ))}

        {/* Total */}
        <div className="border-t border-[var(--border)] mt-2 pt-3 flex justify-between items-center">
          <span className="font-semibold text-[var(--text-primary)]">Total / Month</span>
          <span className="text-xl font-bold text-[var(--accent)]">
            {formatCurrency(trueCost.totalMonthly)}
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs text-[var(--text-muted)] leading-relaxed">
        Estimates based on current rates. Actual costs may vary. Consult a
        licensed mortgage professional for personalized figures.
      </p>
    </Card>
  );
}
