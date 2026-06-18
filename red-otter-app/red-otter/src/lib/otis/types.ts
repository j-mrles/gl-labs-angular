export interface ReportAnalysis {
  otisScore: number;
  valueSummary: string;
  valueVerdict: "underpriced" | "fair" | "overpriced";
  neighborhoodGrade: string;
  neighborhoodSummary: string;
  redFlags: string[];
  negotiationTips: string[];
  otisTake: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
