import React from 'react';
import { Play } from 'lucide-react';

interface UrlFormProps {
  videoUrl: string;
  onUrlChange: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function UrlForm({ videoUrl, onUrlChange, onSubmit, isLoading }: UrlFormProps) {
  return (
    <form onSubmit={onSubmit} className="max-w-3xl mx-auto mb-12">
      <div className="flex gap-3">
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="Paste YouTube or Wistia URL here..."
          className="flex-1 px-6 py-4 rounded-2xl bg-gray-800/50 border border-gray-700/50 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 focus:outline-none transition-all duration-300 backdrop-blur-sm text-lg placeholder:text-gray-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`px-8 py-4 bg-red-500 hover:bg-red-600 rounded-2xl flex items-center gap-3 transition-all duration-300 font-semibold text-lg hover:scale-105 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          <Play className="w-6 h-6" />
          {isLoading ? 'Loading...' : 'Play'}
        </button>
      </div>
    </form>
  );
}