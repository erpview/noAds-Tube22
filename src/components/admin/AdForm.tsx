import React from 'react';
import { useAdStore } from '../../stores/adStore';
import type { AdConfig } from '../../types/youtube';

interface AdFormProps {
  initialData?: AdConfig;
  onSubmit: () => void;
}

export function AdForm({ initialData, onSubmit }: AdFormProps) {
  const { createAd, updateAd } = useAdStore();
  const [formData, setFormData] = React.useState<Partial<AdConfig>>(
    initialData || {
      name: '',
      url: '',
      type: 'pre-roll',
      platform: 'youtube',
      interval: 300,
      maxPlays: 0,
      skipAfter: 5,
      enabled: true,
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData?.id) {
        await updateAd(initialData.id, formData);
      } else {
        await createAd(formData as AdConfig);
      }
      onSubmit();
    } catch (error) {
      console.error('Error saving ad:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300">Name</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Video URL</label>
        <input
          type="url"
          value={formData.url || ''}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Platform</label>
        <select
          value={formData.platform}
          onChange={(e) => setFormData({ ...formData, platform: e.target.value as 'youtube' | 'vimeo' })}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
        >
          <option value="youtube">YouTube</option>
          <option value="vimeo">Vimeo</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'pre-roll' | 'mid-roll' })}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
        >
          <option value="pre-roll">Pre-roll</option>
          <option value="mid-roll">Mid-roll</option>
        </select>
      </div>

      {formData.type === 'mid-roll' && (
        <div>
          <label className="block text-sm font-medium text-gray-300">Interval (seconds)</label>
          <input
            type="number"
            value={formData.interval || 300}
            onChange={(e) => setFormData({ ...formData, interval: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            min="30"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300">Skip After (seconds)</label>
        <input
          type="number"
          value={formData.skipAfter || 5}
          onChange={(e) => setFormData({ ...formData, skipAfter: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Max Plays (0 for unlimited)</label>
        <input
          type="number"
          value={formData.maxPlays || 0}
          onChange={(e) => setFormData({ ...formData, maxPlays: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          min="0"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.enabled}
          onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
          className="rounded bg-gray-700 border-gray-600 text-red-500 focus:ring-red-500"
        />
        <label className="ml-2 text-sm text-gray-300">Enabled</label>
      </div>

      <button
        type="submit"
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        {initialData ? 'Update Ad' : 'Create Ad'}
      </button>
    </form>
  );
}