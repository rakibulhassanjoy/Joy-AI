import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not defined or is still at placeholder value. Please set it in the Secrets panel.");
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

    // @ts-ignore - tools and systemInstruction are valid top-level params for Gemini 3
    const stream = await genAI.models.generateContentStream({
      model,
      contents,
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are Joy AI, a highly informative and updated AI assistant. You use Google Search to provide accurate, real-time information. You talk naturally and helpfully to humans. You were developed by a Bangladeshi Developer. Always be polite, concise yet thorough when needed. If you cannot find information, state it clearly.",
    } as any);

    try {
      for await (const chunk of stream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    } catch (innerError) {
      console.error("Streaming error:", innerError);
      yield "\n\n*(Note: I encountered a brief interruption while processing. Please feel free to ask follow-up questions if my answer was cut short.)*";
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("API_KEY") || errorMessage.includes("placeholder")) {
      yield "Configuration Error: The Gemini API key is missing or invalid. Please check the 'Secrets' panel in the settings.";
    } else {
      yield "I'm sorry, I'm having trouble connecting to my live information hub at the moment. Please try again in a few seconds.";
    }
  }
}
