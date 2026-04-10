// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the AI with your secure environment variable
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  // Security Check: Make sure you have your API key set up!
  if (!genAI) {
    return NextResponse.json({ 
      reply: "Oops! My developer hasn't given me my API Key yet. (Missing GEMINI_API_KEY in .env file)" 
    });
  }

  try {
    // 1. Grab the message from your frontend chat window
    const body = await req.json();
    const userMessage = body.message;

    // 2. Load the fast, conversational AI model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Give the AI its personality and rules!
    const systemPrompt = `
      You are the McCollins Group Fashion Assistant. 
      You are a stylish, helpful, and friendly AI working for a premium clothing store in Tanzania. 
      The store's private label is called "Colman Looks".
      
      Rules:
      - Keep your answers concise, friendly, and under 3 sentences if possible.
      - If asked about delivery, say it is handled securely via WhatsApp across Tanzania.
      - If asked about the brand, proudly talk about Colman Looks.
      - Respond to this customer's message: "${userMessage}"
    `;

    // 4. Generate the response
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // 5. Send it perfectly back to the frontend chat bubble
    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { reply: "Sorry, my fashion circuits are a bit crossed right now! Try again in a moment." }, 
      { status: 500 }
    );
  }
}