import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Youtube, Settings, LogIn, User } from 'lucide-react';
import { useUserStore } from '../stores/userStore';

export function Header() {
  const location = useLocation();
  const { profile, signOut } = useUserStore();
  const isAdminPage = location.pathname === '/admin';
  const isUserDashboard = location.pathname === '/dashboard';

  return (
    <div className="w-full flex flex-col items-center justify-center mb-12">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
        {/* Left side - only visible on desktop */}
        <div className="hidden sm:block flex-1">
          {profile && !isAdminPage && (
            <Link
              to="/dashboard"
              className={`bg-gray-800/50 hover:bg-gray-700/50 p-2.5 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm inline-flex ${
                isUserDashboard ? 'bg-red-500/20 text-red-500' : ''
              }`}
              title="My Dashboard"
            >
              <User className="w-6 h-6" />
            </Link>
          )}
        </div>

        {/* Center - Logo and Title */}
        <Link 
          to="/" 
          className="flex items-center justify-center gap-4 group transition-transform duration-300 hover:scale-105"
        >
          <Youtube className="w-12 h-12 text-red-500 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-red-100 to-gray-300 bg-clip-text text-transparent whitespace-nowrap">
            noAds-Tube
          </h1>
        </Link>

        {/* Right side - Auth buttons */}
        <div className="flex-1 flex justify-center sm:justify-end gap-3 w-full sm:w-auto">
          {profile ? (
            <>
              {/* Mobile dashboard link */}
              <div className="sm:hidden">
                {!isAdminPage && (
                  <Link
                    to="/dashboard"
                    className={`bg-gray-800/50 hover:bg-gray-700/50 p-2.5 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm inline-flex ${
                      isUserDashboard ? 'bg-red-500/20 text-red-500' : ''
                    }`}
                    title="My Dashboard"
                  >
                    <User className="w-6 h-6" />
                  </Link>
                )}
              </div>
              {profile.is_admin && (
                <Link
                  to="/admin"
                  className={`bg-gray-800/50 hover:bg-gray-700/50 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm inline-flex items-center gap-2 ${
                    isAdminPage ? 'bg-red-500/20 text-red-500' : ''
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="bg-gray-800/50 hover:bg-gray-700/50 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm inline-flex items-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                to="/signup"
                className="bg-red-500 hover:bg-red-600 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <User className="w-5 h-5" />
                <span>Sign Up</span>
              </Link>
              <Link
                to="/login"
                className="bg-gray-800/50 hover:bg-gray-700/50 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {!isAdminPage && !isUserDashboard && (
        <p className="text-xl text-center text-gray-400 max-w-2xl mx-auto leading-relaxed animate-fade-in px-4">
          Watch videos with only one ad. Simply search Your video. Create an account and store your favourite channels.
        </p>
      )}
    </div>
  );
}
