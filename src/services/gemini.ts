import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function* streamChat(messages: { role: 'user' | 'model', content: string }[]) {
  const model = "gemini-3-flash-preview";
  
  try {
    const genAI = getAI();
    
    // Convert roles for Gemini
    const contents = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const stream = await genAI.models.generateContentStream({
      model,
      contents,
      config: {
        systemInstruction: "You are Joy AI, a highly informative and updated AI assistant. You use Google Search to provide accurate, real-time information. You talk naturally and helpfully to humans. You were developed by a Bangladeshi Developer. Always be polite, concise yet thorough when needed.",
        tools: [{ googleSearch: {} }],
      }
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    yield "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment.";
  }
}
