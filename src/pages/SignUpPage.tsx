import React, { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { UserPlus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SignUpPage() {
  const { signUp, loading, error } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    try {
      await signUp(email, password);
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
          
          {(error || validationError) && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              {error || validationError}
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

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>

            <p className="text-sm text-center text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-red-500 hover:text-red-400">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}