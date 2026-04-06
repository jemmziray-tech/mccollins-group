// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        reply: "SYSTEM ERROR: Vercel cannot find the GEMINI_API_KEY." 
      });
    }

    // 1. Fetch live inventory
    const products = await prisma.product.findMany({
      select: { name: true, brand: true, price: true }
    });

    let liveInventoryList = "";
    if (products.length > 0) {
      liveInventoryList = products.map((p: any) => 
        `- ${p.name} (${p.brand}) - Tsh ${p.price.toLocaleString()}`
      ).join("\n");
    } else {
      liveInventoryList = "- No products currently available.";
    }

    // 2. Initialize AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are the exclusive, high-end AI Fashion Concierge for McCollins Group in Tanzania.

      CRITICAL RULES:
      1. BRAND BOUNDARIES: McCollins Group is STRICTLY a premium MEN'S FASHION brand. NEVER mention "Nataka Afya", food, "Akili Hub", education, or stationery.
      2. ANTI-HALLUCINATION: ONLY recommend products from the "Live Inventory" list below. DO NOT invent items, colors, or prices.
      3. OUT OF SCOPE: If a user asks about politics, programming, or anything unrelated to fashion, politely redirect them back to the clothing line.

      LIVE INVENTORY & PRICING:
      ${liveInventoryList}

      YOUR PERSONA & SALES STRATEGY:
      - Tone: Sophisticated, helpful, and welcoming. 
      - Language: Respond seamlessly in Swahili or English, matching whatever language the user speaks.
      - Formatting: Use bullet points and **bold text** to make product names and prices stand out. Keep paragraphs very short for mobile reading.
      - The Upsell: When recommending an item, always try to suggest one matching item to complete the look.
      - Call to Action: NEVER let the conversation end awkwardly. Always close your response with an engaging question.
      
      CONTACT INFORMATION:
      - Sales & Orders: +255 678 405 111
      - Customer Support: +255 693 485 566`
    });

    // 3. Process the message
    const { message } = await req.json();
    const result = await model.generateContent(message);
    const response = await result.response;
    
    return NextResponse.json({ reply: response.text() });

  } catch (error: any) {
    // --- THE NEW PRODUCTION ERROR HANDLING ---
    
    // 1. Log the ugly error to Vercel so YOU can see what went wrong behind the scenes
    console.error("Critical AI Error:", error);

    // 2. Return a polite, branded fallback message to the customer so you don't lose the sale
    return NextResponse.json({ 
      reply: `Samahani, mtandao wangu una hitilafu kidogo kwa sasa. *(I'm experiencing a slight network delay right now).* \n\nTafadhali wasiliana na timu yetu moja kwa moja kupitia WhatsApp kwa msaada wa haraka:\n\n**Sales & Orders:** +255 678 405 111\n**Customer Support:** +255 693 485 566` 
    });
  }
}
