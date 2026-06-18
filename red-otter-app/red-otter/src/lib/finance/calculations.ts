interface MortgageInput {
  price: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
}

interface MortgageResult {
  loanAmount: number;
  monthlyPayment: number;
  downPayment: number;
  totalInterest: number;
  totalCost: number;
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const downPayment = Math.round(input.price * (input.downPaymentPercent / 100));
  const loanAmount = input.price - downPayment;
  const monthlyRate = input.interestRate / 100 / 12;
  const numPayments = input.loanTermYears * 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / numPayments;
  } else {
    monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  const totalCost = monthlyPayment * numPayments;
  const totalInterest = totalCost - loanAmount;

  return { loanAmount, monthlyPayment: Math.round(monthlyPayment), downPayment, totalInterest: Math.round(totalInterest), totalCost: Math.round(totalCost) };
}

interface TrueCostInput extends MortgageInput {
  annualPropertyTax: number;
  annualInsurance: number;
  monthlyHoa: number;
}

interface TrueCostResult {
  mortgage: number;
  propertyTax: number;
  insurance: number;
  hoa: number;
  maintenance: number;
  totalMonthly: number;
}

export function calculateTrueCost(input: TrueCostInput): TrueCostResult {
  const { monthlyPayment } = calculateMortgage(input);
  const propertyTax = Math.round(input.annualPropertyTax / 12);
  const insurance = Math.round(input.annualInsurance / 12);
  const maintenance = Math.round((input.price * 0.01) / 12);

  return {
    mortgage: monthlyPayment,
    propertyTax,
    insurance,
    hoa: input.monthlyHoa,
    maintenance,
    totalMonthly: monthlyPayment + propertyTax + insurance + input.monthlyHoa + maintenance,
  };
}
