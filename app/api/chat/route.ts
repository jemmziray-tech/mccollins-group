import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini AI client
const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return new NextResponse("Message is required", { status: 400 });
    }

    // This is the secret instruction that gives your AI its personality!
    const systemInstruction = `
      You are the official McCollins Group AI Assistant. 
      You help customers with our 3 brands: 
      1. Colman Looks (Premium fashion & dresses)
      2. Nataka Afya (Healthy food, premium rice)
      3. Akili Hub (Books and stationery)
      Keep your answers short, friendly, and helpful. Always recommend our products if it makes sense!
    `;

    // Ask Gemini to generate a response
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error("Chat Error:", error);
    return new NextResponse("Failed to generate response", { status: 500 });
  }
}