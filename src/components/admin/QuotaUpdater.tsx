import React, { useState } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { checkAllKeysQuota } from '../../lib/youtube';

export function QuotaUpdater() {
  const [updating, setUpdating] = useState(false);

  const handleUpdateQuota = async () => {
    setUpdating(true);
    try {
      await checkAllKeysQuota();
    } catch (error) {
      console.error('Failed to update quotas:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <button
      onClick={handleUpdateQuota}
      disabled={updating}
      className="bg-gray-800/50 hover:bg-gray-700/50 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Update quota usage for all keys"
    >
      {updating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Updating...
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4" />
          Update Quotas
        </>
      )}
    </button>
  );
}