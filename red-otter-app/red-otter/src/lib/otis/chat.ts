import { llmComplete } from "@/lib/llm";
import { isOnTopic, sanitizeInput } from "./guardrails";
import { buildChatPrompt } from "./prompts";
import type { ChatMessage, ReportAnalysis } from "./types";

const DEFLECTION_MESSAGE =
  "I'm built to help you find the right home! Want to analyze a listing or ask me about a property?";

export async function chatWithOtis(
  userMessage: string,
  reportContext: ReportAnalysis | null,
  history: ChatMessage[]
): Promise<string> {
  if (!isOnTopic(userMessage)) {
    return DEFLECTION_MESSAGE;
  }

  const sanitized = sanitizeInput(userMessage);
  const systemPrompt = buildChatPrompt(reportContext);

  const messages = [
    ...history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user" as const, content: sanitized },
  ];

  return llmComplete(systemPrompt, messages, 1024);
}
