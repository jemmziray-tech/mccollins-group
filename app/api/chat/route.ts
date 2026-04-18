// app/api/chat/route.ts
export const dynamic = "force-dynamic"; 

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. SECURE CONFIGURATION CHECK
    if (!apiKey) {
      console.error("[API_ERROR] Missing Gemini API Key in environment variables.");
      return NextResponse.json(
        { reply: "Our concierge system is currently undergoing maintenance. Please contact support via WhatsApp." },
        { status: 500 }
      );
    }

    // 2. SAFE BODY PARSING & INPUT VALIDATION
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { reply: "I received an unreadable format. Could you please try asking again?" },
        { status: 400 }
      );
    }

    if (!body || !body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { reply: "I didn't quite catch that. Could you please specify what you're looking for?" },
        { status: 400 }
      );
    }

    const userMessage = body.message.trim();
    const userName = body.userName || "a Guest";
    const history = Array.isArray(body.history) ? body.history : []; 

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 3. RESILIENT DATABASE FETCHING
    let inventoryList = "";
    try {
      const availableProducts = await prisma.product.findMany({
        where: { 
          isAvailable: true,
          stock: { gt: 0 } // Never recommend sold out items!
        },
        select: { 
          id: true, 
          name: true, 
          price: true, 
          category: true, 
          department: true,
          description: true 
        }
      });

      inventoryList = availableProducts
        .map(p => `- NAME: ${p.name} | DEPT: ${p.department} | CATEGORY: ${p.category} | PRICE: Tsh ${p.price.toLocaleString()} | DESC: ${p.description || "Premium fashion item."} | LINK: /product/${p.id}`)
        .join("\n");
        
    } catch (dbError) {
      // We log the specific DB error to the server, but keep the UI clean
      console.warn("[PRISMA_WARNING] Database unreachable. AI will use fallback mode.", dbError);
      inventoryList = "SYSTEM NOTE: Live database connection is currently paused. Guide the user to contact WhatsApp for stock inquiries.";
    }

    const chatTranscript = history
      .map((msg: any) => `${msg.role === 'user' ? userName : 'Assistant'}: ${msg.text}`)
      .join("\n");

    // 4. MASTER CONCIERGE PROMPT
    const systemPrompt = `
      You are the official McCollins Group Fashion Assistant, a premium, stylish, and highly intelligent personal shopper for our luxury store in Tanzania.
      You are chatting with: ${userName}.
      
      === STORE KNOWLEDGE ===
      - Brand Name: McCollins (Our private label is called "Colman Looks")
      - Sales/Orders WA: +255 678 405 111
      - Support WA: +255 693 485 566
      - Email: info@mccollinsgroup.com
      - Location & Delivery: Based in Tanzania. Delivery is handled securely and free via WhatsApp across the country.
      
      === LIVE INVENTORY DATA ===
      Below is our exact, real-time catalog. You must ONLY recommend items from this list.
      ${inventoryList}
      
      === YOUR SEARCH & RECOMMENDATION ENGINE (CRITICAL) ===
      When the user asks for an item (e.g., "bags", "shoes", "office wear", "blue jeans", "leather"):
      1. ANALYZE the request to identify the core product type, department (Men/Women), or description keywords.
      2. SCAN the LIVE INVENTORY DATA deeply. Look at the "CATEGORY", "DEPT", and "DESC" fields, not just the "NAME". (e.g., If they want "bags", look for "Bags & Purses" in the Category).
      3. MATCH the best 1 to 3 items.
      4. RECOMMEND them enthusiastically. State the Name, Price, and briefly mention why it fits their request based on its description.
      
      === STRICT RULES ===
      - NO HALLUCINATIONS: Never invent products. If an item is NOT in the LIVE INVENTORY DATA, we do not have it.
      - PIVOT GRACEFULLY: If they ask for something we don't have, politely apologize and suggest the closest available alternative from our inventory.
      - FORMATTING: ALWAYS use Markdown. **Bold** product names and prices.
      - CLICKABLE LINKS: You MUST provide a clickable Markdown link for EVERY product you recommend using its exact LINK path. 
        Example: "You will love our [McCollins Exclusive Bag](/product/12345) for **Tsh 50,000**!"
      - TONE: Concise (under 4 sentences), premium, warm, and helpful.
      - LANGUAGE: Respond seamlessly in the exact language the user is speaking (fluent Swahili or English).
      
      === CONVERSATION HISTORY ===
      ${chatTranscript || "No previous history."}
      ====================================
      
      Current message from ${userName}: "${userMessage}"
      
      Please reply using your Search & Recommendation Engine, keeping the previous conversation context in mind!
    `;

    const result = await model.generateContent(systemPrompt);
    const text = await result.response.text();

    // 5. SUCCESSFUL RESPONSE
    return NextResponse.json({ reply: text }, { status: 200 });

  } catch (error: unknown) {
    // 6. MODERN, TYPE-SAFE ERROR HANDLING
    console.error("[GEMINI_CHAT_ERROR]", error);

    let status = 500;
    let reply = "I apologize, but my styling systems are momentarily offline. Please try again in a moment or contact our support team on WhatsApp.";

    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      // Handle Rate Limiting (429 Too Many Requests)
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("rate limit")) {
        status = 429;
        reply = "I am currently assisting a large volume of clients. Please give me a brief moment to catch my breath and ask again! ⏳";
      } 
      // Handle Overloaded Server (503 Service Unavailable)
      else if (errorMessage.includes("503") || errorMessage.includes("overloaded")) {
        status = 503;
        reply = "My connection to the main boutique is slightly delayed. Please try your request again in a few seconds. 🛍️";
      }
      // Handle strict content moderation blocks by Google
      else if (errorMessage.includes("safety") || errorMessage.includes("blocked")) {
        status = 400;
        reply = "I am unable to process that specific request. How else may I assist you with your wardrobe today?";
      }
    }

    // Return the branded error message WITH the correct HTTP status code
    return NextResponse.json({ reply }, { status });
  }
}