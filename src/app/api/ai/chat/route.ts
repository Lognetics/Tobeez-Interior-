import { z } from "zod";
import { chatComplete, activeProvider, type AIMessage } from "@/lib/ai/providers";
import {
  buildGroundedFallback,
  buildGroundingMessage,
  retrievePlatformKnowledge,
} from "@/lib/ai/knowledge";
import { getConsultants, getProducts } from "@/lib/data/catalog";
import type { Product } from "@/lib/data/products";
import { authenticateApiRequest, authenticationRequired } from "@/lib/auth/api-auth";
import { getAuthenticatedUserContext } from "@/lib/ai/user-context";

export const runtime = "nodejs";
export const maxDuration = 60;

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4_000),
  images: z.array(z.string().max(4_000_000)).max(3).optional(),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(30),
  // "image" / "video" mean a visual is being generated alongside this reply,
  // so the model must caption it instead of consulting.
  mode: z.enum(["chat", "image", "video"]).default("chat"),
});

function studioCaptionInstruction(mode: "image" | "video") {
  const artifact = mode === "video"
    ? "cinematic interior walkthrough video"
    : "photorealistic interior redesign image";
  return [
    "",
    `IMPORTANT — Studio generation mode: a ${artifact} is ALREADY being generated for this exact request and will appear directly below your reply. You are TOBEEZ AI inside the TOBEEZ Design Studio.`,
    "Reply with a short caption of at most 3 sentences describing the design direction being applied.",
    "Do NOT write step-by-step guides, numbered lists, consultations, or shopping lists.",
    "Do NOT ask the user for more details or measurements.",
    "Do NOT suggest using TOBEEZ AI Design Studio or any other app or AI tool — the user is already here — and never provide prompts for other tools.",
    "Do NOT list, name, or link marketplace products in your reply — the interface automatically shows matching TOBEEZ marketplace products as product cards below your message.",
  ].join("\n");
}

function stripUnverifiedLinks(text: string) {
  return text
    .replace(/\[([^\]]+)]\((?:https?:\/\/|\/)[^)]+\)/g, "$1")
    .replace(/https?:\/\/[^\s)]+/g, "")
    .trim();
}

function privateRecordIntent(query: string) {
  return /\b(my|mine)\b/i.test(query) &&
    /\b(project|estimate|budget|order|purchase|booking|consultation|design|workspace|account)s?\b/i.test(query);
}

function privateRecordAnswer(query: string, context: string) {
  const queryLower = query.toLowerCase();
  const prefixes = [
    /project/.test(queryLower) ? "Project:" : "",
    /estimate|budget/.test(queryLower) ? "Saved estimate:" : "",
    /order|purchase/.test(queryLower) ? "Marketplace order:" : "",
    /booking|consultation/.test(queryLower) ? "Consultation:" : "",
    /design/.test(queryLower) ? "Saved design brief:" : "",
  ].filter(Boolean);
  const allLines = context.split("\n").filter(Boolean);
  const matching = prefixes.length
    ? allLines.filter((line) => prefixes.some((prefix) => line.startsWith(prefix)))
    : allLines;
  const lines = (matching.length ? matching : allLines).slice(0, 8);
  return lines.length
    ? `Here is what I found in your TOBEEZ workspace:\n\n${lines.map((line) => `- ${line}`).join("\n")}`
    : "I could not find any matching saved records in your TOBEEZ workspace.";
}

export async function POST(req: Request) {
  const identity = await authenticateApiRequest(req);
  if (!identity) return authenticationRequired();

  let messages: AIMessage[];
  let mode: "chat" | "image" | "video";
  try {
    const body = requestSchema.parse(await req.json());
    messages = body.messages.slice(-16);
    mode = body.mode;
  } catch {
    return Response.json({ error: "Invalid chat request" }, { status: 400 });
  }

  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
  if (!latestUserMessage) {
    return Response.json({ error: "A user message is required" }, { status: 400 });
  }

  const [{ products }, designers, userContext] = await Promise.all([
    getProducts(),
    getConsultants(),
    getAuthenticatedUserContext(identity.id, identity.accessToken),
  ]);
  const retrieval = retrievePlatformKnowledge(latestUserMessage.content, { products, designers });
  const provider = activeProvider();
  const modelUserContext = provider.keyless ? "" : userContext;
  const sources = retrieval.results.map((result) => result.source);

  // In generation modes, matched catalogue products go back as structured
  // data so the studio renders real linked product cards instead of relying
  // on the model to write names and prices.
  const recommendedProducts = mode === "chat" ? [] : retrieval.results
    .filter((result) => result.source.id.startsWith("product-"))
    .map((result) => products.find((product) => `product-${product.id}` === result.source.id))
    .filter((product): product is Product => Boolean(product))
    .slice(0, 3)
    .map(({ id, name, brand, category, price, rating, reviews }) => ({ id, name, brand, category, price, rating, reviews }));

  // Keep private workspace data off keyless third-party inference. Common
  // private-record questions can still be answered deterministically.
  if (provider.keyless && userContext && privateRecordIntent(latestUserMessage.content)) {
    return Response.json({
      text: privateRecordAnswer(latestUserMessage.content, userContext),
      sources,
      grounded: true,
      fallback: true,
      provider,
    });
  }

  const groundingMessage: AIMessage = {
    role: "system",
    content:
      buildGroundingMessage(latestUserMessage.content, retrieval.results) +
      (modelUserContext
        ? "\n\nAuthenticated user's TOBEEZ records (private to this request):\n" + modelUserContext +
          "\nUse these records when the user asks about their own projects, estimates, orders, bookings, or saved designs."
        : "") +
      (mode !== "chat" ? studioCaptionInstruction(mode) : ""),
  };

  try {
    // Private workspace records must never fall back to keyless inference.
    const generatedText = await chatComplete([groundingMessage, ...messages], {
      allowKeylessFallback: !modelUserContext,
    });
    const text = sources.length || modelUserContext ? stripUnverifiedLinks(generatedText) : generatedText;
    return Response.json({
      text,
      sources,
      grounded: sources.length > 0 || Boolean(modelUserContext),
      fallback: false,
      provider,
      products: recommendedProducts,
    });
  } catch (err) {
    console.error("AI chat provider failed, serving grounded fallback:", err);
    const fallback = buildGroundedFallback(
      retrieval.results,
      retrieval.explicitPlatformQuestion,
    );
    return Response.json({
      text: fallback ?? "I'm having trouble reaching the AI service right now. Please try again in a moment.",
      sources: fallback ? sources : [],
      grounded: Boolean(fallback),
      fallback: true,
      error: process.env.NODE_ENV === "development" ? String(err) : undefined,
      provider,
      products: recommendedProducts,
    });
  }
}

export async function GET() {
  const retrieval = retrievePlatformKnowledge("TOBEEZ platform");
  return Response.json({
    ok: true,
    provider: activeProvider(),
    retrieval: { ready: true, knowledgeRecords: retrieval.knowledgeSize },
  });
}
