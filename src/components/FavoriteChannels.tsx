import React, { useEffect, useState } from 'react';
import { getFavoriteChannels, removeFavoriteChannel } from '../lib/supabase';
import { Trash2 } from 'lucide-react';

interface FavoriteChannelsProps {
  userId: string;
  onChannelSelect: (channelId: string) => void;
  selectedChannel: string | null;
}

export function FavoriteChannels({ userId, onChannelSelect, selectedChannel }: FavoriteChannelsProps) {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChannels();
  }, [userId]);

  const loadChannels = async () => {
    try {
      const data = await getFavoriteChannels(userId);
      setChannels(data);
    } catch (error) {
      setError('Failed to load favorite channels');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveChannel = async (channelId: string) => {
    try {
      await removeFavoriteChannel(userId, channelId);
      await loadChannels();
    } catch (error) {
      console.error('Failed to remove channel:', error);
    }
  };

  if (loading) {
    return <div className="text-center">Loading channels...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">My Favorite Channels</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {channels.map((channel) => (
          <div
            key={channel.channel_id}
            className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 ${
              selectedChannel === channel.channel_id
                ? 'border-red-500 scale-105'
                : 'border-gray-700/30 hover:border-red-500/50'
            }`}
            onClick={() => onChannelSelect(channel.channel_id)}
          >
            <img
              src={channel.channel_thumbnail}
              alt={channel.channel_name}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-sm font-medium truncate">{channel.channel_name}</p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveChannel(channel.channel_id);
              }}
              className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {channels.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No favorite channels yet. Add some from the search results! Click "+" to add channel to your list.
        </div>
      )}
    </div>
  );
}