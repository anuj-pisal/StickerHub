'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface PromptBarProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function PromptBar({ onSubmit, isLoading = false, placeholder = "Describe your edit..." }: PromptBarProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center bg-zinc-900 border border-white/10 rounded-full p-1 shadow-2xl focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
        <Sparkles className="absolute left-4 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full bg-transparent border-none py-3 pl-12 pr-32 text-white placeholder:text-gray-500 focus:outline-none focus:ring-0 rounded-full"
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="absolute right-1 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating</span>
            </>
          ) : (
            'Generate'
          )}
        </button>
      </div>
    </form>
  );
}
