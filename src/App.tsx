import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './stores/userStore';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { UserDashboard } from './pages/UserDashboard';

export default function App() {
  const { profile, fetchProfile } = useUserStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/admin"
              element={
                profile?.is_admin ? <AdminPage /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/dashboard"
              element={
                profile ? <UserDashboard /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/login"
              element={
                profile ? (
                  profile.is_admin ? (
                    <Navigate to="/admin" replace />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                ) : (
                  <LoginPage />
                )
              }
            />
            <Route
              path="/signup"
              element={
                profile ? (
                  profile.is_admin ? (
                    <Navigate to="/admin" replace />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                ) : (
                  <SignUpPage />
                )
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}