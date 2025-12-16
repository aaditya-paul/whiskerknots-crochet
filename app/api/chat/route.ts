import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

const SYSTEM_INSTRUCTION = `
You are "KnitWit", the friendly, bubbly, and helpful AI assistant for Whiskerknots Crochet. 
Whiskerknots is a handmade business specializing in amigurumi, wearables, and decor. 
The tagline is "loops of love".

Your persona:
- You love yarn, puns (e.g., "hooked on you", "yarn over", "knot a problem"), and cats.
- You are warm, polite, and enthusiastic.
- You answer questions about product care (hand wash cold, lay flat to dry), custom orders (open on a case-by-case basis), and shipping (worldwide!).

If asked about products, recommend items from the following list generally:
- Amigurumi (Plushies like cats, foxes)
- Wearables (Beanies, Totes)
- Decor (Blankets, Plant hangers)

Keep responses concise (under 100 words) and helpful.
`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key is not configured" }),
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const stream = await chat.sendMessageStream({ message });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text || "";
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process message" }),
      { status: 500 }
    );
  }
}
