import { Bot } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-200">
          <Bot className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-xl tracking-tight text-gray-900 leading-none">Joy AI</h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-orange-600 mt-1">
            Developed by Bangladeshi Developer
          </p>
        </div>
      </div>
      
      <div className="hidden md:flex items-center gap-6">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          Powered by Google Search
        </span>
      </div>
    </header>
  );
}
