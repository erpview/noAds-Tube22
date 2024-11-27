import React from 'react';
import { useAdStore } from '../../stores/adStore';
import { Play, Pause, Edit, Trash2, Clock } from 'lucide-react';
import type { AdConfig } from '../../types/youtube';

interface AdListProps {
  onEdit: (ad: AdConfig) => void;
}

export function AdList({ onEdit }: AdListProps) {
  const { ads, loading, error, toggleAdStatus, deleteAd } = useAdStore();

  if (loading) return <div className="text-center">Loading ads...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      {ads.map((ad) => (
        <div
          key={ad.id}
          className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{ad.name}</h3>
            <p className="text-sm text-gray-400">{ad.url}</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Skip after {ad.skipAfter}s
              </span>
              {ad.type === 'mid-roll' && (
                <span>Interval: {ad.interval}s</span>
              )}
              {ad.maxPlays > 0 && (
                <span>Max plays: {ad.maxPlays}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleAdStatus(ad.id!)}
              className={`p-2 rounded-lg ${
                ad.enabled ? 'bg-green-500/20 text-green-500' : 'bg-gray-700 text-gray-400'
              }`}
              title={ad.enabled ? 'Disable ad' : 'Enable ad'}
            >
              {ad.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => onEdit(ad)}
              className="p-2 rounded-lg bg-blue-500/20 text-blue-500"
              title="Edit ad"
            >
              <Edit className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this ad?')) {
                  deleteAd(ad.id!);
                }
              }}
              className="p-2 rounded-lg bg-red-500/20 text-red-500"
              title="Delete ad"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      
      {ads.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No ads found. Create one to get started.
        </div>
      )}
    </div>
  );
}