import { describe, it, expect } from "vitest";
import { calculateMortgage, calculateTrueCost } from "@/lib/finance/calculations";

describe("calculateMortgage", () => {
  it("calculates monthly mortgage payment", () => {
    const result = calculateMortgage({ price: 400000, downPaymentPercent: 20, interestRate: 7, loanTermYears: 30 });
    expect(result.loanAmount).toBe(320000);
    expect(result.monthlyPayment).toBeCloseTo(2129, 0);
    expect(result.downPayment).toBe(80000);
  });

  it("handles zero down payment", () => {
    const result = calculateMortgage({ price: 300000, downPaymentPercent: 0, interestRate: 6.5, loanTermYears: 30 });
    expect(result.loanAmount).toBe(300000);
    expect(result.monthlyPayment).toBeCloseTo(1896, 0);
  });
});

describe("calculateTrueCost", () => {
  it("estimates total monthly cost of ownership", () => {
    const result = calculateTrueCost({
      price: 400000,
      downPaymentPercent: 20,
      interestRate: 7,
      loanTermYears: 30,
      annualPropertyTax: 5000,
      annualInsurance: 1800,
      monthlyHoa: 200,
    });
    expect(result.mortgage).toBeCloseTo(2129, 0);
    expect(result.propertyTax).toBeCloseTo(417, 0);
    expect(result.insurance).toBe(150);
    expect(result.hoa).toBe(200);
    expect(result.maintenance).toBeCloseTo(333, 0);
    expect(result.totalMonthly).toBeCloseTo(3229, 0);
  });
});
