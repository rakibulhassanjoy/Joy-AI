import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Search, MessageCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Message from './components/Message';
import { streamChat } from './services/gemini';
import { cn } from './lib/utils';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const SUGGESTIONS = [
  "What's the latest news in Dhaka?",
  "Tell me something interesting about Bangladesh.",
  "How's the weather in London right now?",
  "Explain quantum computing simply.",
];

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent, customInput?: string) => {
    e?.preventDefault();
    const text = customInput || input;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const newModelMessage: ChatMessage = { role: 'model', content: '' };
    setMessages(prev => [...prev, newModelMessage]);

    try {
      let fullContent = '';
      const stream = streamChat([...messages, userMessage]);
      
      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'model') {
            return [...prev.slice(0, -1), { ...last, content: fullContent }];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      <Header />

      <main className="max-w-4xl mx-auto pt-28 pb-32 min-h-screen flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 rounded-3xl bg-orange-500 flex items-center justify-center mb-8 shadow-2xl shadow-orange-200"
            >
              <Sparkles className="text-white w-10 h-10" />
            </motion.div>
            
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            >
              Welcome <span className="text-orange-500 underline decoration-orange-200 underline-offset-8">Sir</span>
            </motion.h2>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-500 max-w-lg mb-12 text-lg leading-relaxed"
            >
              I am Joy AI. Ask me anything. I use real-time Google search to provide you with the most updated information.
            </motion.p>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-4"
            >
              {SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={suggestion}
                  onClick={() => handleSubmit(undefined, suggestion)}
                  className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl text-left text-sm hover:border-orange-500 hover:shadow-md transition-all group active:scale-95"
                >
                  <span className="text-gray-600 group-hover:text-gray-900 font-medium">{suggestion}</span>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 space-y-2 pb-10">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, index) => (
                <Message key={index} role={msg.role} content={msg.content} />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-[#FDFCFB] via-[#FDFCFB] to-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <form 
            onSubmit={handleSubmit}
            className="relative group"
          >
            <div className="absolute inset-x-0 bottom-full mb-4 px-4 flex justify-center">
               <div className="bg-orange-50/80 backdrop-blur-sm px-3 py-1 rounded-full border border-orange-100 flex items-center gap-2">
                 <Search size={12} className="text-orange-500" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600">Google Grounding Active</span>
               </div>
            </div>
            
            <div className="relative bg-white border-2 border-gray-100 rounded-3xl shadow-xl shadow-gray-100/50 overflow-hidden focus-within:border-orange-500 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Joy AI anything..."
                className="w-full px-6 py-5 pr-20 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 font-medium"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                  input.trim() && !isLoading 
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-200 hover:scale-105 active:scale-95" 
                    : "bg-gray-100 text-gray-300"
                )}
              >
                <Send size={20} />
              </button>
            </div>
          </form>
          
          <p className="mt-4 text-center text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em]">
            Joy AI can make mistakes. Verify important info.
          </p>
        </div>
      </div>
    </div>
  );
}
