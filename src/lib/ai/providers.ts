import "server-only";

/**
 * Real AI provider layer (server-only — used by route handlers).
 *
 * Text/vision chat is REAL. It uses, in priority order:
 *   1. OpenAI       (if OPENAI_API_KEY)
 *   2. Anthropic    (if ANTHROPIC_API_KEY)
 *   3. Pollinations (keyless, no account required — the default)
 *
 * So the assistant is a genuine smart model out of the box, and upgrades to
 * a premium model the moment a key is added. Models are env-configurable.
 */

export type AIPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  images?: string[]; // data URLs or public URLs for vision
};

export const SYSTEM_PROMPT =
  "You are TOBEEZ AI, the intelligent assistant for TOBEEZ Interiors, a premium AI interior " +
  "technology platform. You are an expert interior designer (styles, space planning, materials, " +
  "furniture, lighting, colour, budgeting and cost estimation). Stay focused on interior planning and " +
  "the TOBEEZ platform. Never invent TOBEEZ prices, product availability, policies, people, or features; " +
  "platform-specific claims must come from retrieved context supplied in a separate system message. " +
  "Be warm, concise and practical. Use light markdown for structured answers. " +
  "When a user uploads a room photo, analyse it and give specific, actionable redesign guidance. " +
  "When helpful, offer to generate images or an estimate. Currency is Nigerian Naira (₦) unless told otherwise.";

function toOpenAIContent(m: AIMessage): string | AIPart[] {
  if (!m.images?.length) return m.content;
  return [
    { type: "text", text: m.content },
    ...m.images.map((url) => ({ type: "image_url" as const, image_url: { url } })),
  ];
}

function withSystem(messages: AIMessage[]): AIMessage[] {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.filter((message) => message.role === "system"),
    ...messages.filter((message) => message.role !== "system"),
  ];
}

async function viaOpenAI(messages: AIMessage[], key: string): Promise<string> {
  const model = process.env.OPENAI_MODEL || "gpt-5.5";
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: withSystem(messages).map((m) => ({ role: m.role, content: toOpenAIContent(m) })),
    }),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}

async function viaAnthropic(messages: AIMessage[], key: string): Promise<string> {
  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";
  const prepared = withSystem(messages);
  const sys = prepared.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const convo = messages.filter((m) => m.role !== "system");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model, max_tokens: 1200, system: sys,
      messages: convo.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.images?.length
          ? [
              { type: "text", text: m.content },
              ...m.images.map((url) => ({ type: "image", source: { type: "url", url } })),
            ]
          : m.content,
      })),
    }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}`);
  const j = await r.json();
  return j.content?.map((c: { text?: string }) => c.text ?? "").join("") ?? "";
}

async function viaPollinations(messages: AIMessage[]): Promise<string> {
  const model = process.env.POLLINATIONS_MODEL || "openai";
  const r = await fetch("https://text.pollinations.ai/openai", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model,
      messages: withSystem(messages).map((m) => ({ role: m.role, content: toOpenAIContent(m) })),
      private: true,
    }),
  });
  if (!r.ok) throw new Error(`Pollinations ${r.status}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? j.response ?? "";
}

/**
 * Real chat completion (text + optional vision). Cascades OpenAI → Anthropic →
 * keyless so a single provider hiccup (rate limit, timeout) never surfaces as
 * "AI service cannot be reached". Set allowKeylessFallback to false when the
 * messages contain private user records — those must stay off keyless
 * third-party inference, so keyed-provider failure throws instead.
 */
export async function chatComplete(
  messages: AIMessage[],
  options: { allowKeylessFallback?: boolean } = {},
): Promise<string> {
  const { allowKeylessFallback = true } = options;
  const openai = process.env.OPENAI_API_KEY;
  const anthropic = process.env.ANTHROPIC_API_KEY;

  let lastError: unknown;
  if (openai) {
    try {
      return await viaOpenAI(messages, openai);
    } catch (error) {
      lastError = error;
    }
  }
  if (anthropic) {
    try {
      return await viaAnthropic(messages, anthropic);
    } catch (error) {
      lastError = error;
    }
  }

  const keylessIsPrimary = !openai && !anthropic;
  if (keylessIsPrimary || allowKeylessFallback) {
    try {
      return await viaPollinations(messages);
    } catch (error) {
      throw lastError ?? error;
    }
  }
  throw lastError ?? new Error("No AI provider available");
}

/** Which real provider is active (for UI display). */
export function activeProvider(): { id: string; label: string; keyless: boolean } {
  if (process.env.OPENAI_API_KEY) return { id: "openai", label: "OpenAI", keyless: false };
  if (process.env.ANTHROPIC_API_KEY) return { id: "anthropic", label: "Anthropic Claude", keyless: false };
  return { id: "pollinations", label: "TOBEEZ AI (open model)", keyless: true };
}
