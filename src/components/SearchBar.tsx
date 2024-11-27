import React, { useState, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const searchTimeout = useRef<number>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timeout
    if (searchTimeout.current) {
      window.clearTimeout(searchTimeout.current);
    }

    // Set new timeout for search
    searchTimeout.current = window.setTimeout(() => {
      onSearch(value);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTimeout.current) {
      window.clearTimeout(searchTimeout.current);
    }
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search for YouTube videos..."
          className="w-full px-6 py-4 pr-12 rounded-2xl bg-gray-800/50 border border-gray-700/50 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 focus:outline-none transition-all duration-300 backdrop-blur-sm text-lg placeholder:text-gray-500"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-6 h-6 text-gray-400" />
          )}
        </div>
      </div>
    </form>
  );
}