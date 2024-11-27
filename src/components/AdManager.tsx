import React, { useState, useEffect } from 'react';
import { useAdStore } from '../stores/adStore';
import { Play, Pause, Edit, Trash2, Plus, X, Hash } from 'lucide-react';
import type { Ad } from '../types/youtube';

export function AdManager() {
  const { ads, loading, error, createAd, updateAd, deleteAd, toggleAdStatus, adPlayCounts, fetchAds } = useAdStore();
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState<Partial<Ad>>({
    name: '',
    url: '',
    type: 'pre-roll',
    platform: 'youtube',
    skipAfter: 5,
    interval: 300,
    maxPlays: 0,
    enabled: true
  });

  useEffect(() => {
    fetchAds().catch(console.error);
  }, [fetchAds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAd) {
        await updateAd(editingAd.id, formData);
      } else {
        await createAd(formData as Omit<Ad, 'id'>);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving ad:', error);
      alert('Failed to save ad. Please try again.');
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingAd(null);
    setFormData({
      name: '',
      url: '',
      type: 'pre-roll',
      platform: 'youtube',
      skipAfter: 5,
      interval: 300,
      maxPlays: 0,
      enabled: true
    });
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData(ad);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading ads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500 text-center">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Add New Ad
        </button>
      </div>

      <div className="grid gap-4">
        {ads.map(ad => (
          <div key={ad.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{ad.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAdStatus(ad.id)}
                  className={`p-2.5 rounded-lg ${ad.enabled ? 'bg-green-500/20 text-green-500' : 'bg-gray-700'} transition-all duration-300 hover:scale-110`}
                  title={ad.enabled ? 'Disable ad' : 'Enable ad'}
                >
                  {ad.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEdit(ad)}
                  className="p-2.5 rounded-lg bg-blue-500/20 text-blue-500 transition-all duration-300 hover:scale-110"
                  title="Edit ad"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this ad?')) {
                      deleteAd(ad.id);
                    }
                  }}
                  className="p-2.5 rounded-lg bg-red-500/20 text-red-500 transition-all duration-300 hover:scale-110"
                  title="Delete ad"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-400 space-y-2">
              <p className="truncate">{ad.url}</p>
              <div className="flex flex-wrap gap-4">
                <span className="bg-gray-700/50 px-3 py-1 rounded-full capitalize">{ad.platform}</span>
                <span className="bg-gray-700/50 px-3 py-1 rounded-full">{ad.type}</span>
                <span className="bg-gray-700/50 px-3 py-1 rounded-full">Skip after {ad.skipAfter}s</span>
                {ad.type === 'mid-roll' && ad.interval && (
                  <span className="bg-gray-700/50 px-3 py-1 rounded-full">Interval: {ad.interval}s</span>
                )}
                <span className="bg-gray-700/50 px-3 py-1 rounded-full flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Plays: {adPlayCounts[ad.id] || 0}
                  {ad.maxPlays > 0 && ` / ${ad.maxPlays}`}
                </span>
              </div>
            </div>
          </div>
        ))}

        {ads.length === 0 && (
          <div className="text-center text-gray-400 py-12 bg-gray-800/30 rounded-xl backdrop-blur-sm">
            <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No ads found. Create one to get started.</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{editingAd ? 'Edit Ad' : 'New Ad'}</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2.5 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Video URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2.5 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Platform</label>
                <select
                  value={formData.platform}
                  onChange={e => setFormData(prev => ({ ...prev, platform: e.target.value as 'youtube' | 'vimeo' }))}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2.5 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                >
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as 'pre-roll' | 'mid-roll' }))}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2.5 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                >
                  <option value="pre-roll">Pre-roll</option>
                  <option value="mid-roll">Mid-roll</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Skip After (seconds)</label>
                <input
                  type="number"
                  value={formData.skipAfter}
                  onChange={e => setFormData(prev => ({ ...prev, skipAfter: Number(e.target.value) }))}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2.5 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  min="0"
                  required
                />
              </div>
              
              {formData.type === 'mid-roll' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Interval (seconds)</label>
                  <input
                    type="number"
                    value={formData.interval}
                    onChange={e => setFormData(prev => ({ ...prev, interval: Number(e.target.value) }))}
                    className="w-full bg-gray-800 rounded-lg px-4 py-2.5 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    min="30"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Max Plays (0 for unlimited)</label>
                <input
                  type="number"
                  value={formData.maxPlays}
                  onChange={e => setFormData(prev => ({ ...prev, maxPlays: Number(e.target.value) }))}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2.5 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  min="0"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={e => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded bg-gray-800 border-gray-700 text-red-500 focus:ring-red-500"
                />
                <label htmlFor="enabled" className="ml-2 text-sm">Enable this ad</label>
              </div>

              <button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105"
              >
                {editingAd ? 'Update Ad' : 'Create Ad'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}