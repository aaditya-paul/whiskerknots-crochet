import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;

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

export const getGeminiChat = (): Chat => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  if (!chatSession) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
  return chatSession;
};

export const sendMessageStream = async (message: string) => {
    const chat = getGeminiChat();
    return await chat.sendMessageStream({ message });
};
