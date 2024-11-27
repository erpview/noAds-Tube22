import React, { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { LogIn, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LoginPage() {
  const { signIn, loading, error } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
    } catch (error) {
      // Error is handled by the store
      console.error('Login error:', error);
    }
  };

  const getErrorMessage = (error: any) => {
    if (error?.__isAuthError && error?.code === 'invalid_credentials') {
      return 'Invalid email or password. Please try again.';
    }
    return error?.message || 'An error occurred. Please try again.';
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              {getErrorMessage(error)}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-3 py-2 border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-3 py-2 border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>

            <p className="text-sm text-center text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-red-500 hover:text-red-400">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}