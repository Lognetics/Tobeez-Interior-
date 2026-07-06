import { NextRequest } from "next/server";
import { chatComplete, activeProvider, type AIMessage } from "@/lib/ai/providers";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let messages: AIMessage[] = [];
  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!messages.length) return Response.json({ error: "No messages" }, { status: 400 });

  try {
    const text = await chatComplete(messages);
    return Response.json({ text, provider: activeProvider() });
  } catch (err) {
    return Response.json(
      {
        text:
          "I'm having trouble reaching the AI service right now. Please try again in a moment. " +
          "(Tip: add an OPENAI_API_KEY or ANTHROPIC_API_KEY in your environment for a faster, more reliable model.)",
        error: String(err),
        provider: activeProvider(),
      },
      { status: 200 },
    );
  }
}

export async function GET() {
  return Response.json({ ok: true, provider: activeProvider() });
}
