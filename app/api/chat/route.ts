// app/api/chat/route.ts
export const dynamic = "force-dynamic"; 

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        reply: "⚠️ ERROR: Vercel cannot find the API key." 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const body = await req.json();
    
    const userMessage = body.message;
    const userName = body.userName || "a Guest";
    const history = body.history || []; 

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let inventoryList = "";
    try {
      // 🟢 THE DATA UPGRADE: We now fetch the Description AND ensure stock is greater than 0!
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

      // 🟢 THE CONTEXT UPGRADE: We feed the AI every single detail about the product
      inventoryList = availableProducts
        .map(p => `- NAME: ${p.name} | DEPT: ${p.department} | CATEGORY: ${p.category} | PRICE: Tsh ${p.price.toLocaleString()} | DESC: ${p.description || "Premium fashion item."} | LINK: /product/${p.id}`)
        .join("\n");
        
    } catch (dbError) {
      console.warn("Database unreachable locally. AI will use fallback mode.");
      inventoryList = "SYSTEM NOTE: Live database connection is currently paused.";
    }

    const chatTranscript = history
      .map((msg: any) => `${msg.role === 'user' ? userName : 'Assistant'}: ${msg.text}`)
      .join("\n");

    // 🟢 THE PROMPT UPGRADE: A highly structured, "Chain-of-Thought" master prompt
    const systemPrompt = `
      You are the official McCollins Group Fashion Assistant, a premium, stylish, and highly intelligent personal shopper for our luxury store in Tanzania.
      You are chatting with: ${userName}.
      
      === STORE KNOWLEDGE ===
      - Brand Name: McCollins (Our private label is called "Colman Looks")
      - Sales/Orders WA: +255 678 405 111
      - Support WA: +255 693 485 566
      - Email: info@mccollinsgroup.com
      - Location & Delivery: Based in Tanzania. Delivery is handled securely via WhatsApp across the country.
      
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

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("AI Chat Error:", error);
    
    if (error.message && error.message.includes("429")) {
      return NextResponse.json({ 
        reply: "Whoa, slow down! 😅 I'm getting a lot of messages at once. Please give me about 60 seconds to catch my breath!" 
      });
    }

    if (error.message && error.message.includes("503")) {
      return NextResponse.json({ 
        reply: "I'm helping a lot of shoppers right now! Give me just a few seconds and try asking again. 🛍️" 
      });
    }

    return NextResponse.json({ 
      reply: `⚠️ API Error: ${error.message || "Unknown error occurred"}` 
    });
  }
}