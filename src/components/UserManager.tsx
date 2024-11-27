import React, { useEffect, useState } from 'react';
import { supabase, deleteUser } from '../lib/supabase';
import { Check, X, Loader2, Trash2 } from 'lucide-react';
import { useUserStore } from '../stores/userStore';

interface User {
  id: string;
  email: string;
  is_approved: boolean;
  is_admin: boolean;
  created_at: string;
}

export function UserManager() {
  const { profile: currentUser } = useUserStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingUsers, setDeletingUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId: string, approve: boolean) => {
    // Prevent admin from removing their own approval
    if (userId === currentUser?.id) {
      setError('You cannot modify your own approval status');
      return;
    }

    try {
      const { error } = await supabase.rpc('approve_user', {
        user_id: userId,
        should_approve: approve
      });

      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_approved: approve } : user
      ));
    } catch (error) {
      console.error('Error updating user approval:', error);
      setError('Failed to update user approval status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Prevent admin from deleting themselves
    if (userId === currentUser?.id) {
      setError('You cannot delete your own account');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setDeletingUsers(prev => ({ ...prev, [userId]: true }));
    try {
      await deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again.');
    } finally {
      setDeletingUsers(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Management</h2>
      
      <div className="grid gap-4">
        {users.map(user => (
          <div
            key={user.id}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{user.email}</p>
                {user.is_admin && (
                  <span className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full text-xs">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-sm ${
                user.is_approved ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
              }`}>
                {user.is_approved ? 'Approved' : 'Pending'}
              </div>
              
              {/* Only show management buttons for non-admin users */}
              {!user.is_admin && (
                <>
                  {!user.is_approved ? (
                    <button
                      onClick={() => handleApproval(user.id, true)}
                      className="p-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 transition-colors"
                      title="Approve user"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApproval(user.id, false)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                      title="Revoke approval"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={deletingUsers[user.id]}
                    className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete user"
                  >
                    {deletingUsers[user.id] ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}