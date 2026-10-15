/**
 * StudentApp.jsx
 * Standalone Student-only entry point.
 * Accessed via: http://localhost:5173/student.html
 * Shows only student-relevant pages, no admin portal access.
 */
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import FlashScreen from './components/FlashScreen';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import AIAssistantPage from './pages/AIAssistantPage';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import PuzzleArena from './pages/PuzzleArena';
import CodingPractice from './pages/CodingPractice';
import CodingDetail from './pages/CodingDetail';
import AptitudePuzzles from './pages/AptitudePuzzles';
import AptitudeTest from './pages/AptitudeTest';
import TechnicalPrep from './pages/TechnicalPrep';
import MockInterviews from './pages/MockInterviews';
import InterviewSession from './pages/InterviewSession';
import Analytics from './pages/Analytics';
import Competitions from './pages/Competitions';
import LeaderboardPage from './pages/LeaderboardPage';
import SettingsPage from './pages/SettingsPage';
import PlacementDrives from './pages/PlacementDrives';
import GroupDiscussionPage from './pages/GroupDiscussionPage';
import ComprehensiveAssessment from './pages/ComprehensiveAssessment';
import NotFound from './pages/NotFound';

export default function StudentApp() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('arena_student_splash_shown');
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('arena_student_splash_shown', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <FlashScreen onComplete={handleSplashComplete} mode="student" />;
  }

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login defaultRole="student" />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/student.html" element={<Navigate to="/dashboard" replace />} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Student Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><DashboardLayout><AIAssistantPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/resume" element={<ProtectedRoute><DashboardLayout><ResumeAnalyzer /></DashboardLayout></ProtectedRoute>} />
            <Route path="/resume-analyzer" element={<ProtectedRoute><DashboardLayout><ResumeAnalyzer /></DashboardLayout></ProtectedRoute>} />
            <Route path="/puzzles" element={<ProtectedRoute><DashboardLayout><PuzzleArena /></DashboardLayout></ProtectedRoute>} />
            <Route path="/coding" element={<ProtectedRoute><DashboardLayout><CodingPractice /></DashboardLayout></ProtectedRoute>} />
            <Route path="/coding/:problemId" element={<ProtectedRoute><DashboardLayout><CodingDetail /></DashboardLayout></ProtectedRoute>} />
            <Route path="/aptitude" element={<ProtectedRoute><DashboardLayout><AptitudePuzzles /></DashboardLayout></ProtectedRoute>} />
            <Route path="/aptitude/test/:categoryId" element={<ProtectedRoute><DashboardLayout><AptitudeTest /></DashboardLayout></ProtectedRoute>} />
            <Route path="/technical" element={<ProtectedRoute><DashboardLayout><TechnicalPrep /></DashboardLayout></ProtectedRoute>} />
            <Route path="/mock-interview" element={<ProtectedRoute><DashboardLayout><MockInterviews /></DashboardLayout></ProtectedRoute>} />
            <Route path="/mock-interview/session/:roleId" element={<ProtectedRoute><DashboardLayout><InterviewSession /></DashboardLayout></ProtectedRoute>} />
            <Route path="/interviews" element={<ProtectedRoute><DashboardLayout><MockInterviews /></DashboardLayout></ProtectedRoute>} />
            <Route path="/interviews/session/:roleId" element={<ProtectedRoute><DashboardLayout><InterviewSession /></DashboardLayout></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><DashboardLayout><Analytics /></DashboardLayout></ProtectedRoute>} />
            <Route path="/competitions" element={<ProtectedRoute><DashboardLayout><Competitions /></DashboardLayout></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><DashboardLayout><LeaderboardPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/placement-drives" element={<ProtectedRoute><DashboardLayout><PlacementDrives /></DashboardLayout></ProtectedRoute>} />
            <Route path="/drives" element={<Navigate to="/placement-drives" replace />} />
            <Route path="/group-discussion" element={<ProtectedRoute><DashboardLayout><GroupDiscussionPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/gd" element={<Navigate to="/group-discussion" replace />} />
            <Route path="/assessment" element={<ProtectedRoute><DashboardLayout><ComprehensiveAssessment /></DashboardLayout></ProtectedRoute>} />
            <Route path="/comprehensive-assessment" element={<Navigate to="/assessment" replace />} />

            {/* Block admin route from student app */}
            <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route path="*" element={<ProtectedRoute><DashboardLayout><NotFound /></DashboardLayout></ProtectedRoute>} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}
