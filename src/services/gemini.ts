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
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      "HTTP-Referer": "https://ais-build.com",
      "X-Title": "Joy AI",
    }
  });

  try {
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        { 
          role: "system", 
          content: "You are Joy AI, a highly informative and updated AI assistant. You talk naturally and helpfully to humans. You were developed by a Bangladeshi Developer. Always be polite, concise yet thorough when needed. If you cannot find information, state it clearly." 
        },
        ...messages.map(m => ({
          role: (m.role === 'model' ? 'assistant' : 'user') as 'assistant' | 'user',
          content: m.content
        }))
      ],
      stream: true,
    });

    let hasReceivedContent = false;
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        hasReceivedContent = true;
        yield content;
      }
    }

    if (!hasReceivedContent) {
      yield "I received an empty response from Joy AI. This can happen if the model is overloaded or the API key has issues.";
    }
  } catch (error: any) {
    console.error("OpenRouter Error:", error);
    const errorMessage = error?.message || String(error);
    yield `I'm sorry, I'm having trouble connecting to Joy AI via OpenRouter. \n\n**Error details:** ${errorMessage}`;
  }
}
