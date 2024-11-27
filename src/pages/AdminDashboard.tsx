import React, { useEffect, useState } from 'react';
import { useAdStore } from '../stores/adStore';
import { AdForm } from '../components/admin/AdForm';
import { AdList } from '../components/admin/AdList';
import { Plus, X } from 'lucide-react';
import type { AdConfig } from '../types/youtube';

export function AdminDashboard() {
  const { fetchAds } = useAdStore();
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<AdConfig | null>(null);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleEdit = (ad: AdConfig) => {
    setEditingAd(ad);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAd(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Ad Management</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Ad
          </button>
        </div>

        <AdList onEdit={handleEdit} />

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editingAd ? 'Edit Ad' : 'New Ad'}
                </h2>
                <button
                  onClick={handleFormClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <AdForm
                initialData={editingAd || undefined}
                onSubmit={handleFormClose}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}