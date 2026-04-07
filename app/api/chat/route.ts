// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateText } from "ai"; 
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// 1. Initialize Gemini
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Secure Database Connection
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(req: Request) {
  try {
    // FIX 1: Match the frontend payload exactly!
    const { message } = await req.json();

    // 2. FETCH LIVE INVENTORY
    const availableProducts = await prisma.product.findMany({
      where: { isAvailable: true },
      select: { name: true, price: true, category: true, description: true }
    });

    // 3. BUILD THE INVENTORY CONTEXT STRING
    const inventoryList = availableProducts
      .map(p => `- ${p.name} (${p.category}): Tsh ${p.price.toLocaleString()}. Details: ${p.description}`)
      .join("\n");

    // 4. CREATE THE MASTER SYSTEM PROMPT
    const systemPrompt = `
      You are the official McCollins Fashion AI Assistant. You are polite, stylish, and brief.
      Your job is to help customers find clothes and answer questions.
      
      CRITICAL RULE: Here is our LIVE, REAL-TIME inventory. You MUST ONLY recommend products from this exact list. Do not make up products or prices.
      
      --- LIVE INVENTORY ---
      ${inventoryList.length > 0 ? inventoryList : "Currently out of stock of everything."}
      ----------------------
      
      If a customer asks for something not on this list, apologize and say it is currently out of stock.
    `;

    // FIX 2: Generate standard text (no streaming) so the frontend can parse the JSON easily
    const result = await generateText({
      model: google("gemini-1.5-flash"), // Changed this line!
      system: systemPrompt,
      prompt: message,
    });

    // Send the response back as a perfect JSON object
    return NextResponse.json({ reply: result.text });
    
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Error processing chat" }, { status: 500 });
  }
}