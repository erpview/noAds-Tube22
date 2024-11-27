import React, { useEffect, useState, useRef } from 'react';
import { useUserStore } from '../stores/userStore';
import { getChannelVideos } from '../lib/youtube';
import { SearchBar } from '../components/SearchBar';
import { VideoPlayer } from '../components/VideoPlayer';
import { FavoriteChannels } from '../components/FavoriteChannels';
import { ChannelVideos } from '../components/ChannelVideos';
import type { VideoDetails } from '../types/youtube';

export function UserDashboard() {
  const { profile } = useUserStore();
  const [selectedVideo, setSelectedVideo] = useState<VideoDetails | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channelVideos, setChannelVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChannel) {
      loadChannelVideos(selectedChannel);
    }
  }, [selectedChannel]);

  useEffect(() => {
    if (selectedVideo && playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedVideo]);

  const loadChannelVideos = async (channelId: string, pageToken?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getChannelVideos(channelId, pageToken);
      if (pageToken) {
        setChannelVideos(prev => [...prev, ...response.items]);
      } else {
        setChannelVideos(response.items);
      }
      setNextPageToken(response.nextPageToken);
    } catch (error) {
      setError('Failed to load channel videos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (selectedChannel && nextPageToken) {
      loadChannelVideos(selectedChannel, nextPageToken);
    }
  };

  if (!profile?.is_approved) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Account Pending Approval</h2>
        <p className="text-gray-400">
          Your account is waiting for administrator approval.
          You'll be able to access your dashboard once approved.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Dashboard</h2>
      </div>

      <FavoriteChannels
        userId={profile.id}
        onChannelSelect={setSelectedChannel}
        selectedChannel={selectedChannel}
      />

      {selectedChannel ? (
        <ChannelVideos
          videos={channelVideos}
          loading={loading}
          error={error}
          onVideoSelect={(videoId) => setSelectedVideo({ id: videoId, platform: 'youtube' })}
          onLoadMore={handleLoadMore}
          hasMore={!!nextPageToken}
        />
      ) : (
        <div className="text-center py-12 text-gray-400">
          Select a channel to view its latest videos
        </div>
      )}

      <div ref={playerRef}>
        {selectedVideo && <VideoPlayer videoDetails={selectedVideo} />}
      </div>
    </div>
  );
}