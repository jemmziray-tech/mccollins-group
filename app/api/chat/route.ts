// app/api/chat/route.ts
import { PrismaClient } from "@prisma/client";
// Import your AI provider here (e.g., OpenAI, GoogleGenAI, etc. depending on what you installed)
import { generateText, streamText } from "ai"; 
import { openai } from "@ai-sdk/openai"; // Adjust if using Gemini/Anthropic

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 1. FETCH LIVE INVENTORY
    // We only fetch Active products, and only the fields the AI needs to know
    const availableProducts = await prisma.product.findMany({
      where: { isAvailable: true },
      select: { name: true, price: true, category: true, description: true }
    });

    // 2. BUILD THE INVENTORY CONTEXT STRING
    const inventoryList = availableProducts
      .map(p => `- ${p.name} (${p.category}): Tsh ${p.price.toLocaleString()}. Details: ${p.description}`)
      .join("\n");

    // 3. CREATE THE MASTER SYSTEM PROMPT
    const systemPrompt = `
      You are the official McCollins Fashion AI Assistant. You are polite, stylish, and brief.
      Your job is to help customers find clothes and answer questions.
      
      CRITICAL RULE: Here is our LIVE, REAL-TIME inventory. You MUST ONLY recommend products from this exact list. Do not make up products or prices.
      
      --- LIVE INVENTORY ---
      ${inventoryList}
      ----------------------
      
      If a customer asks for something not on this list, apologize and say it is currently out of stock.
    `;

    // 4. SEND TO AI WITH THE INJECTED BRAIN
    const result = await streamText({
      model: openai("gpt-4o-mini"), // Or whatever model you are using
      system: systemPrompt,
      messages: messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Error processing chat", { status: 500 });
  }
}