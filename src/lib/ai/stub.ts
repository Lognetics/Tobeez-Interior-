/**
 * Stubbed AI engine. This is a deterministic, offline stand-in for a real
 * LLM/vision backend (OpenAI, vector search, etc.). Swap the implementation
 * here for a real API call — the calling components never need to change.
 */

export type ChatMessage = { role: "user" | "assistant"; content: string };

const CANNED: { match: RegExp; reply: string }[] = [
  {
    match: /budget|cost|price|estimate|expensive/i,
    reply:
      "Great question! Furnishing cost depends on property type, floor area, design style and material quality. The fastest way to get an accurate figure is our AI Cost Estimator — it itemises furniture, finishes, labour and contingency. Want me to point you there?",
  },
  {
    match: /style|modern|minimal|luxury|scandinav|design/i,
    reply:
      "For a timeless yet contemporary feel, many clients love Japandi (warm minimalism) or Modern Luxury (rich textures, brass accents, layered lighting). Tell me your property type and I'll suggest a palette and key pieces.",
  },
  {
    match: /consult|designer|book|appointment|meeting/i,
    reply:
      "You can book a virtual, phone or in-person session with one of our vetted interior experts on the Consultation page. Sessions include a moodboard review and a tailored plan.",
  },
  {
    match: /material|tile|marble|wood|floor/i,
    reply:
      "For high-traffic areas, large-format porcelain tiles offer durability with a marble look at a lower cost. Engineered oak brings warmth to living spaces. I can compare lifespan and price per sqm if you'd like.",
  },
];

const FALLBACK =
  "I'm TOBEEZ AI, your interior planning assistant. I can help with budgets, design styles, materials, space optimisation and booking a consultation. What are you working on?";

/** Simulate a chat completion with a short, realistic delay. */
export async function stubChat(messages: ChatMessage[]): Promise<string> {
  const last = messages[messages.length - 1]?.content ?? "";
  await new Promise((r) => setTimeout(r, 550));
  const hit = CANNED.find((c) => c.match.test(last));
  return hit?.reply ?? FALLBACK;
}
