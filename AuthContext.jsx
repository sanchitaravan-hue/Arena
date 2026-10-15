import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  registerUser,
  loginUser,
  logoutUser,
  sendPasswordReset,
  subscribeToAuthChanges,
  MOCK_USER,
} from '../firebase/auth';
import { updateFirestoreUserDocument } from '../firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(MOCK_USER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRegister = async (email, password, extraData) => {
    setLoading(true);
    try {
      const newUser = await registerUser(email, password, extraData);
      setUser(newUser);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await loginUser(email, password);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (email) => {
    await sendPasswordReset(email);
  };

  const handleUpdateProfile = async (updateFields) => {
    if (!user) return;
    const updated = await updateFirestoreUserDocument(user.uid, updateFields);
    if (typeof updated === 'object') {
      setUser(updated);
    } else {
      setUser((prev) => ({ ...prev, ...updateFields }));
    }
  };

  const recalculatePlacementReadinessScore = async (activityImpact = 0) => {
    if (!user) return;
    const currentScore = user.placementReadinessScore || 70;
    const newScore = Math.min(99, Math.max(50, currentScore + activityImpact));
    await handleUpdateProfile({ placementReadinessScore: newScore });
  };

  const loginAdmin = async (username, password) => {
    setLoading(true);
    try {
      const cleanUser = (username || '').trim().toLowerCase();
      if ((cleanUser === 'admin' || cleanUser === 'admin@arena.edu') && password === 'Admin@123') {
        const adminData = await loginUser('admin', 'Admin@123');
        setUser(adminData);
        return { success: true, user: adminData };
      } else {
        throw new Error('Access Denied: Only username: admin and password: Admin@123 can access the admin side.');
      }
    } finally {
      setLoading(false);
    }
  };

  const exitAdminMode = async () => {
    const studentData = { ...MOCK_USER, role: 'student' };
    localStorage.setItem('arena_user_session', JSON.stringify(studentData));
    setUser(studentData);
  };

  const value = {
    user: user ? { ...user, role: user.role || 'student' } : null,
    loading,
    login: handleLogin,
    loginAdmin,
    exitAdminMode,
    register: handleRegister,
    logout: handleLogout,
    resetPassword: handlePasswordReset,
    updateProfile: handleUpdateProfile,
    recalculatePlacementReadinessScore,
    isAdmin: user?.role === 'admin',
    isAuthenticated: Boolean(user),
  };



  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
