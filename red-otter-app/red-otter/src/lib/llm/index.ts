/**
 * Unified LLM client — toggle provider via env vars.
 *
 * LLM_PROVIDER=anthropic (default) | ollama | groq
 *
 * Anthropic:
 *   ANTHROPIC_API_KEY=sk-ant-...
 *
 * Ollama (local Mac Mini):
 *   LLM_PROVIDER=ollama
 *   OLLAMA_BASE_URL=http://localhost:11434   (default)
 *   OLLAMA_MODEL=llama3.2                   (default)
 *
 * Groq (free cloud):
 *   LLM_PROVIDER=groq
 *   GROQ_API_KEY=gsk_...
 *   GROQ_MODEL=llama-3.3-70b-versatile      (default)
 */

import Anthropic from "@anthropic-ai/sdk";

export type LLMMessage = { role: "user" | "assistant"; content: string };

const PROVIDER = (process.env.LLM_PROVIDER ?? "anthropic").toLowerCase();

// ─── Anthropic ────────────────────────────────────────────────────────────────

const anthropicClient = PROVIDER === "anthropic" ? new Anthropic() : null;

async function anthropicComplete(
  system: string,
  messages: LLMMessage[],
  maxTokens = 1024
): Promise<string> {
  const res = await anthropicClient!.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system,
    messages,
  });
  return res.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}

function anthropicStream(
  system: string,
  messages: LLMMessage[],
  maxTokens = 1024
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      try {
        const s = anthropicClient!.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: maxTokens,
          system,
          messages,
        });
        for await (const chunk of s) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "LLM error";
        controller.enqueue(new TextEncoder().encode(`Error: ${msg}`));
      } finally {
        controller.close();
      }
    },
  });
}

// ─── OpenAI-compatible (Ollama + Groq) ───────────────────────────────────────

function getOpenAICompatConfig() {
  if (PROVIDER === "ollama") {
    return {
      baseUrl: (process.env.OLLAMA_BASE_URL ?? "http://localhost:11434").replace(/\/$/, ""),
      model: process.env.OLLAMA_MODEL ?? "llama3.2",
      apiKey: "ollama", // Ollama doesn't need a real key but fetch requires Authorization header
    };
  }
  // groq
  return {
    baseUrl: "https://api.groq.com/openai",
    model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
    apiKey: process.env.GROQ_API_KEY ?? "",
  };
}

async function openAICompatComplete(
  system: string,
  messages: LLMMessage[],
  maxTokens = 1024
): Promise<string> {
  const { baseUrl, model, apiKey } = getOpenAICompatConfig();
  const body = {
    model,
    max_tokens: maxTokens,
    messages: [{ role: "system", content: system }, ...messages],
    stream: false,
  };

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM request failed (${res.status}): ${err}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message?.content ?? "";
}

function openAICompatStream(
  system: string,
  messages: LLMMessage[],
  maxTokens = 1024
): ReadableStream<Uint8Array> {
  const { baseUrl, model, apiKey } = getOpenAICompatConfig();
  const body = {
    model,
    max_tokens: maxTokens,
    messages: [{ role: "system", content: system }, ...messages],
    stream: true,
  };

  return new ReadableStream({
    async start(controller) {
      try {
        const res = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
        });

        if (!res.ok || !res.body) {
          const err = await res.text();
          controller.enqueue(new TextEncoder().encode(`Error: ${err}`));
          controller.close();
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data) as {
                choices: { delta: { content?: string } }[];
              };
              const text = parsed.choices[0]?.delta?.content;
              if (text) controller.enqueue(new TextEncoder().encode(text));
            } catch {
              // malformed chunk — skip
            }
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "LLM stream error";
        controller.enqueue(new TextEncoder().encode(`Error: ${msg}`));
      } finally {
        controller.close();
      }
    },
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Single-shot completion. Returns the full response string.
 */
export async function llmComplete(
  system: string,
  messages: LLMMessage[],
  maxTokens = 1024
): Promise<string> {
  if (PROVIDER === "anthropic") return anthropicComplete(system, messages, maxTokens);
  return openAICompatComplete(system, messages, maxTokens);
}

/**
 * Streaming completion. Returns a ReadableStream of raw text chunks.
 */
export function llmStream(
  system: string,
  messages: LLMMessage[],
  maxTokens = 1024
): ReadableStream<Uint8Array> {
  if (PROVIDER === "anthropic") return anthropicStream(system, messages, maxTokens);
  return openAICompatStream(system, messages, maxTokens);
}

export { PROVIDER as LLM_PROVIDER };
