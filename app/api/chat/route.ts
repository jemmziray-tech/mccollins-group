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
      // 🟢 THE UPGRADE: We are now grabbing the 'id' from the database too!
      const availableProducts = await prisma.product.findMany({
        where: { isAvailable: true },
        select: { id: true, name: true, price: true, category: true }
      });

      // 🟢 THE UPGRADE: We give the AI the exact URL path for every item
      inventoryList = availableProducts
        .map(p => `- ${p.name} (Tsh ${p.price.toLocaleString()}) - Link: /product/${p.id}`)
        .join("\n");
    } catch (dbError) {
      console.warn("Database unreachable locally. AI will use fallback mode.");
      inventoryList = "SYSTEM NOTE: Live database connection is currently paused.";
    }

    const chatTranscript = history
      .map((msg: any) => `${msg.role === 'user' ? userName : 'Assistant'}: ${msg.text}`)
      .join("\n");

    const systemPrompt = `
      You are the official McCollins Group Fashion Assistant. 
      You are a stylish, helpful, and friendly AI working for a premium clothing store in Tanzania. 
      Our exclusive private label is called "Colman Looks".
      
      You are currently chatting with: ${userName}. 
      
      COMPANY KNOWLEDGE BASE:
      - Sales & Orders WhatsApp: +255 678 405 111
      - Customer Support WhatsApp: +255 693 485 566
      - Email: info@mccollinsgroup.com
      - Social Media: We are active on Instagram and TikTok.
      - Location: Tanzania.
      - Delivery: Handled securely via WhatsApp across all of Tanzania.
      
      CURRENT LIVE INVENTORY:
      ${inventoryList}
      
      STRICT RULES:
      1. If the user asks for contact info, happily provide the correct WhatsApp numbers, email, or social media links.
      2. If the user asks for an item on the LIVE INVENTORY list, enthusiastically tell them we have it and state the price!
      3. If they ask for something NOT on the list, politely apologize and suggest something else we DO have.
      4. Keep your answers concise, friendly, and under 3 sentences.
      5. MATCH THE USER'S LANGUAGE: If they speak Swahili, reply in fluent Swahili. If English, reply in English.
      
      // 🟢 THE UPGRADE: Strict formatting rules for clickable links!
      6. FORMATTING: ALWAYS use Markdown. **Bold** product names and prices.
      7. CLICKABLE LINKS: Whenever you recommend a product from the inventory list, you MUST provide a clickable Markdown link using its Link URL. 
         Example format: "You will love the [Classic White Tee](/product/prod_1) for **Tsh 15,000**!"
      
      === PREVIOUS CONVERSATION HISTORY ===
      ${chatTranscript || "No previous history."}
      ====================================
      
      Current message from ${userName}: "${userMessage}"
      
      Please reply keeping the previous conversation context in mind!
    `;

    const result = await model.generateContent(systemPrompt);
    const text = await result.response.text();

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("AI Chat Error:", error);
    
    // 🟢 NEW: Handle the exact Google Rate Limit Error you just hit!
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