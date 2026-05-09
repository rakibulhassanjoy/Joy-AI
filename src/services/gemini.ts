import OpenAI from "openai";

const getOpenRouterKey = () => {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || key === "undefined" || key.includes("PASTE_YOUR")) {
    return null;
  }
  return key;
};

export async function* streamChat(messages: { role: 'user' | 'model', content: string }[]) {
  const apiKey = getOpenRouterKey();
  
  if (!apiKey) {
    yield "### 🔑 Configuration Required\nPlease add your OpenRouter API key:\n1. Open **Settings** (bottom left)\n2. Go to **Secrets**\n3. Add `OPENROUTER_API_KEY` with your key.";
    return;
  }

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": "https://ais-build.com", // Optional, for OpenRouter rankings
      "X-Title": "Joy AI", // Optional
    }
  });

  try {
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001", // Using Gemini via OpenRouter as per user's previous preference for Gemini
      messages: [
        { 
          role: "system", 
          content: "You are Joy AI, a highly informative and updated AI assistant. You talk naturally and helpfully to humans. You were developed by a Bangladeshi Developer. Always be polite, concise yet thorough when needed. Use your internal knowledge and provided tools to be as accurate as possible." 
        },
        ...messages.map(m => ({
          role: (m.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
          content: m.content
        }))
      ],
      stream: true,
    });

    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error("OpenRouter Error:", error);
    yield "I'm sorry, I'm having trouble connecting to Joy AI via OpenRouter right now. Please check your API key or try again later.";
  }
}
