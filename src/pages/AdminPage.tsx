import React from 'react';
import { AdManager } from '../components/AdManager';
import { UserManager } from '../components/UserManager';
import { YouTubeKeyManager } from '../components/admin/YouTubeKeyManager';
import { useUserStore } from '../stores/userStore';

export function AdminPage() {
  const { profile } = useUserStore();

  if (!profile?.is_admin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-500">Access Denied</h2>
        <p className="text-gray-400 mt-2">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="space-y-12">
        <YouTubeKeyManager />
        <UserManager />
        <AdManager />
      </div>
    </div>
  );
}