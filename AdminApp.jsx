/**
 * AdminApp.jsx
 * Standalone Admin-only entry point.
 * Accessed via: http://localhost:5173/admin.html
 * Redirects non-admin logins, shows only admin-relevant pages.
 */
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import FlashScreen from './components/FlashScreen';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

export default function AdminApp() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('arena_admin_splash_shown');
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('arena_admin_splash_shown', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <FlashScreen onComplete={handleSplashComplete} mode="admin" />;
  }

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Admin Login */}
            <Route path="/login" element={<Login defaultRole="admin" />} />
            <Route path="/admin.html" element={<Navigate to="/login" replace />} />
            <Route path="/" element={<Navigate to="/admin" replace />} />

            {/* Admin Dashboard - the only protected page */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <DashboardLayout adminOnly>
                    <AdminDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback to admin */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}
