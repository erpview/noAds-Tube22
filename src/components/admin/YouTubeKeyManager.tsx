import React, { useState, useEffect } from 'react';
import { useYouTubeKeyStore } from '../../stores/youtubeKeyStore';
import { Plus, X, Key, Trash2, Power } from 'lucide-react';
import { QuotaUpdater } from './QuotaUpdater';
import type { YouTubeApiKey } from '../../types/youtube';

export function YouTubeKeyManager() {
  const { keys, loading, error, fetchKeys, addKey, updateKey, deleteKey } = useYouTubeKeyStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    enabled: true
  });

  useEffect(() => {
    fetchKeys();
    // Set up auto-refresh every minute
    const interval = setInterval(fetchKeys, 60000);
    return () => clearInterval(interval);
  }, [fetchKeys]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addKey(formData);
      setShowForm(false);
      setFormData({ name: '', key: '', enabled: true });
    } catch (error) {
      console.error('Error adding key:', error);
    }
  };

  const handleToggleKey = async (key: YouTubeApiKey) => {
    try {
      await updateKey(key.id, { enabled: !key.enabled });
    } catch (error) {
      console.error('Error toggling key:', error);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    try {
      await deleteKey(id);
    } catch (error) {
      console.error('Error deleting key:', error);
    }
  };

  const getQuotaColor = (used: number) => {
    const percentage = (used / 10000) * 100;
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading && keys.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading API keys...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">YouTube API Keys</h2>
        <div className="flex items-center gap-3">
          <QuotaUpdater />
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add API Key
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {keys.map((key) => (
          <div
            key={key.id}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:bg-gray-800"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-lg">{key.name}</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleKey(key)}
                  className={`p-2 rounded-lg transition-colors ${
                    key.enabled ? 'bg-green-500/20 text-green-500' : 'bg-gray-700 text-gray-400'
                  }`}
                  title={key.enabled ? 'Disable key' : 'Enable key'}
                >
                  <Power className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteKey(key.id)}
                  className="p-2 rounded-lg bg-red-500/20 text-red-500 transition-colors hover:bg-red-500/30"
                  title="Delete key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-mono bg-black/30 p-2 rounded-lg overflow-x-auto">{key.key}</p>
              <div className="flex flex-wrap gap-4 text-gray-400">
                <span className={getQuotaColor(key.quotaUsed)}>
                  Quota used: {key.quotaUsed.toLocaleString()}/10,000 ({((key.quotaUsed / 10000) * 100).toFixed(1)}%)
                </span>
                {key.lastUsed && (
                  <span>Last used: {new Date(key.lastUsed).toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {keys.length === 0 && (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl">
            <Key className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">No API keys added yet</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add YouTube API Key</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
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
                  placeholder="e.g., Production Key 1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">API Key</label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={e => setFormData(prev => ({ ...prev, key: e.target.value }))}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2.5 border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono"
                  placeholder="Enter your YouTube API key"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={e => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded bg-gray-800 border-gray-700 text-red-500 focus:ring-red-500"
                  id="enabled"
                />
                <label htmlFor="enabled" className="ml-2 text-sm">
                  Enable this key
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105"
              >
                Add API Key
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}