import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { Bot, User } from 'lucide-react';
import { cn } from '@/src/lib/utils'; // I'll create this helper

interface MessageProps {
  role: 'user' | 'model';
  content: string;
}

export default function Message({ role, content }: MessageProps) {
  const isBot = role === 'model';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full mb-6 gap-4 px-4 md:px-0",
        isBot ? "flex-row" : "flex-row-reverse"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
        isBot ? "bg-orange-500 text-white" : "bg-gray-800 text-white"
      )}>
        {isBot ? <Bot size={18} /> : <User size={18} />}
      </div>
      
      <div className={cn(
        "max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3 shadow-sm text-sm leading-relaxed",
        isBot 
          ? "bg-white text-gray-800 border border-gray-100" 
          : "bg-orange-500 text-white font-medium"
      )}>
        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-white">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}
