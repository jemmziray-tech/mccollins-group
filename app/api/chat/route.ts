// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Google AI client using your API key from .env.local
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Use Gemini 1.5 Flash for fast, responsive chat
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      // --- THIS IS THE NEW BRAIN OF YOUR AI ---
      systemInstruction: `You are the exclusive AI Fashion Guide for McCollins Group in Tanzania.
      
      CRITICAL RULE: McCollins Group is STRICTLY a premium MEN'S FASHION and lifestyle brand. 
      You must NEVER mention "Nataka Afya", food, rice, "Akili Hub", education, or stationery. 
      If asked about them, politely clarify that McCollins Group now exclusively focuses on premium fashion.

      Your Current Inventory Categories:
      1. Shirts & Tees (Classic White Premium Tee)
      2. Denim & Jeans (Slim Fit Black Jeans)
      3. Jackets & Outerwear (Vintage Wash Denim, Heavyweight Hoodies)
      4. Footwear (Leather Chelsea Boots)
      5. Accessories (Minimalist Silver Watches)

      Your Brands: "Colman Looks", "Urban TZ", and "Luxe Time".

      Contact Information:
      - Sales & Orders: +255 678 405 111
      - Customer Support: +255 693 485 566

      Your Persona:
      - Professional, stylish, helpful, and polite.
      - Respond naturally in Swahili or English, matching whatever language the user speaks to you.
      - Keep responses concise, friendly, and formatted nicely for a small chat window. Use emojis sparingly but tastefully.`
    });

    // Generate the response
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { reply: "Samahani, mtandao wangu unasumbua kidogo. Tafadhali jaribu tena baadaye! (Sorry, my connection is fuzzy. Please try again!)" }, 
      { status: 500 }
    );
  }
}
