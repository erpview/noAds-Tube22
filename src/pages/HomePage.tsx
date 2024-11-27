import React, { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { SearchResults } from '../components/SearchResults';
import { VideoPlayer } from '../components/VideoPlayer';
import { searchYouTubeVideos } from '../lib/youtube';
import type { YouTubeSearchResult } from '../lib/youtube';
import type { VideoDetails } from '../types/youtube';

export function HomePage() {
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([]);
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [currentQuery, setCurrentQuery] = useState('');

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentQuery(query);

    try {
      const response = await searchYouTubeVideos(query);
      setSearchResults(response.items);
      setNextPageToken(response.nextPageToken);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to search videos');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!currentQuery || !nextPageToken || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await searchYouTubeVideos(currentQuery, nextPageToken);
      setSearchResults(prev => [...prev, ...response.items]);
      setNextPageToken(response.nextPageToken);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load more videos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoSelect = (videoId: string) => {
    setVideoDetails({
      id: videoId,
      platform: 'youtube'
    });
    setSearchResults([]); // Clear results after selection
    setNextPageToken(undefined);
    setCurrentQuery('');
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      
      {error && (
        <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-center">
          {error}
        </div>
      )}
      
      <SearchResults 
        results={searchResults} 
        onVideoSelect={handleVideoSelect}
        onLoadMore={handleLoadMore}
        hasMore={!!nextPageToken}
        isLoading={isLoading}
      />
      
      <VideoPlayer videoDetails={videoDetails} />
    </div>
  );
}