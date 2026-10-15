import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';
import { createFirestoreUserDocument, getFirestoreUserDocument } from './firestore';

// Strict Administrator Credentials
export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'Admin@123',
  email: 'admin@arena.edu',
};

export const ADMIN_USER = {
  uid: 'arena_admin_officer_01',
  name: 'Placement Administrator',
  email: 'admin@arena.edu',
  role: 'admin',
  profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  phone: '+91 99999 88888',
  college: 'Campus Central Placement Cell',
  degree: 'Head of Corporate Relations',
  branch: 'Placement & Industry Liaison',
  graduationYear: 'Staff',
  bio: 'Official campus placement cell officer. Hosting tier-1 company drives, managing candidate eligibility, and scheduling corporate interviews.',
  targetRole: 'Placement Officer & Drive Host',
  skills: ['Drive Hosting', 'Corporate Relations', 'Candidate Shortlisting', 'Campus Interviews'],
  placementReadinessScore: 100,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Default mock initial student profile
export const MOCK_USER = {
  uid: 'arena_demo_user_101',
  name: 'Alex Rivera',
  email: 'alex.rivera@arena.edu',
  role: 'student',
  profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  phone: '+91 98765 43210',
  college: 'National Institute of Technology (NIT)',
  degree: 'B.Tech',
  branch: 'Computer Science & Engineering',
  graduationYear: '2026',
  bio: 'Aspiring Full Stack Engineer & Competitive Programmer. Preparing for upcoming tier-1 product company placements.',
  targetRole: 'Software Development Engineer (SDE-1)',
  skills: ['Data Structures', 'React.js', 'Node.js', 'Python', 'System Design', 'SQL'],
  experience: 'Software Engineering Intern at CloudTech Labs (Summer 2025)',
  certifications: ['AWS Certified Developer Associate', 'Meta Front-End Developer Specialization'],
  projects: [
    { name: 'Distributed Task Queue', tech: 'Go, Redis, Docker', link: '#' },
    { name: 'Real-Time Analytics Dashboard', tech: 'React, WebSockets, Chart.js', link: '#' }
  ],
  placementReadinessScore: 84,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

import studentProfiles from '../data/studentCredentials.json';

const LOCAL_STORAGE_USER_KEY = 'arena_user_session';
const LOCAL_STORAGE_ACCOUNTS_KEY = 'arena_user_accounts';
const LOCAL_STORAGE_LOGGED_OUT_KEY = 'arena_is_logged_out';

// Helper to format clean display names from email or username
export const formatDisplayName = (identifier) => {
  if (!identifier) return 'Candidate';
  const raw = identifier.includes('@') ? identifier.split('@')[0] : identifier;
  const cleaned = raw.replace(/[._\-0-9]+/g, ' ').trim();
  if (!cleaned) return 'Candidate';
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

// Get all known accounts (preseeded with studentProfiles + registered users)
const getKnownAccounts = () => {
  try {
    const custom = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY) || '[]');
    return [...studentProfiles, ...custom];
  } catch {
    return studentProfiles;
  }
};

const saveCustomAccount = (account) => {
  try {
    const custom = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY) || '[]');
    const filtered = custom.filter((a) => a.email !== account.email && a.uid !== account.uid);
    filtered.push(account);
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Could not save custom account to localStorage:', e);
  }
};

export const registerUser = async (email, password, extraData = {}) => {
  localStorage.removeItem(LOCAL_STORAGE_LOGGED_OUT_KEY);
  const derivedName = extraData.name?.trim() || formatDisplayName(email);

  if (isFirebaseConfigured && auth) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userProfile = {
      uid: user.uid,
      name: derivedName,
      email: user.email,
      role: 'student',
      profilePhoto: extraData.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      phone: extraData.phone || '',
      college: extraData.college || 'Engineering Institute',
      degree: extraData.degree || 'B.Tech',
      branch: extraData.branch || 'Computer Science',
      graduationYear: extraData.graduationYear || '2026',
      bio: extraData.bio || 'Placement contender preparing for top tech roles.',
      targetRole: extraData.targetRole || 'Software Engineer',
      skills: extraData.skills || ['JavaScript', 'Data Structures', 'Problem Solving'],
      experience: extraData.experience || '',
      certifications: extraData.certifications || [],
      projects: extraData.projects || [],
      placementReadinessScore: 78,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createFirestoreUserDocument(userProfile);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userProfile));
    saveCustomAccount({ ...userProfile, password });
    return userProfile;
  } else {
    // Local / Offline Student Registration
    const userProfile = {
      ...MOCK_USER,
      uid: `user_${Date.now()}`,
      email,
      name: derivedName,
      role: 'student',
      targetRole: extraData.targetRole || 'Software Development Engineer (SDE-1)',
      college: extraData.college || 'National Institute of Technology (NIT)',
      skills: extraData.skills || ['JavaScript', 'Data Structures', 'Problem Solving'],
      placementReadinessScore: 80,
    };
    saveCustomAccount({ ...userProfile, username: email.split('@')[0], password });
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userProfile));
    return userProfile;
  }
};

export const loginUser = async (emailOrUsername, password) => {
  localStorage.removeItem(LOCAL_STORAGE_LOGGED_OUT_KEY);
  const cleanId = (emailOrUsername || '').trim().toLowerCase();

  // Strict Administrator Credential Verification
  if (cleanId === 'admin' || cleanId === 'admin@arena.edu') {
    if (password === 'Admin@123') {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(ADMIN_USER));
      return ADMIN_USER;
    } else {
      throw new Error('Access Denied: Invalid Administrator password. Must be Admin@123');
    }
  }

  // Student Authentication with Firebase
  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailOrUsername, password);
      const user = userCredential.user;
      const doc = await getFirestoreUserDocument(user.uid);
      const profile = doc || {
        uid: user.uid,
        email: user.email,
        name: user.displayName || formatDisplayName(user.email),
        role: 'student',
        placementReadinessScore: 80,
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      return profile;
    } catch (err) {
      console.warn('Firebase auth failed, falling back to local credentials:', err);
    }
  }

  // Local/Offline Student Login matching credentials
  const allAccounts = getKnownAccounts();
  const matched = allAccounts.find(
    (acc) =>
      acc.email?.toLowerCase() === cleanId ||
      acc.username?.toLowerCase() === cleanId ||
      acc.email?.toLowerCase().startsWith(`${cleanId}@`)
  );

  if (matched) {
    const userProfile = {
      ...MOCK_USER,
      ...matched,
      role: 'student',
      name: matched.name || formatDisplayName(cleanId),
    };
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userProfile));
    return userProfile;
  }

  // If a new email or username is typed by the user, derive their real name nicely
  const generatedName = formatDisplayName(cleanId);
  const userProfile = {
    ...MOCK_USER,
    uid: `user_${Date.now()}`,
    name: generatedName,
    email: cleanId.includes('@') ? cleanId : `${cleanId}@campus.edu`,
    role: 'student',
    placementReadinessScore: 82,
  };
  saveCustomAccount({ ...userProfile, username: cleanId, password });
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userProfile));
  return userProfile;
};

export const logoutUser = async () => {
  if (isFirebaseConfigured && auth) {
    await firebaseSignOut(auth);
  }
  localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  localStorage.setItem(LOCAL_STORAGE_LOGGED_OUT_KEY, 'true');
};

export const sendPasswordReset = async (email) => {
  if (isFirebaseConfigured && auth) {
    await firebaseSendPasswordResetEmail(auth, email);
  } else {
    console.log(`[Mock Auth] Password reset email sent to ${email}`);
  }
};

export const subscribeToAuthChanges = (callback) => {
  if (isFirebaseConfigured && auth) {
    return firebaseOnAuthStateChanged(auth, async (user) => {
      if (user) {
        const userProfile = await getFirestoreUserDocument(user.uid);
        callback(userProfile || { uid: user.uid, email: user.email, name: user.displayName || formatDisplayName(user.email), role: 'student' });
      } else {
        const isLoggedOut = localStorage.getItem(LOCAL_STORAGE_LOGGED_OUT_KEY) === 'true';
        if (isLoggedOut) {
          callback(null);
        } else {
          const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
          if (stored) {
            try {
              callback(JSON.parse(stored));
            } catch {
              callback(null);
            }
          } else {
            callback(MOCK_USER);
          }
        }
      }
    });
  } else {
    const isLoggedOut = localStorage.getItem(LOCAL_STORAGE_LOGGED_OUT_KEY) === 'true';
    const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (stored) {
      try {
        callback(JSON.parse(stored));
      } catch {
        callback(MOCK_USER);
      }
    } else if (isLoggedOut) {
      callback(null);
    } else {
      callback(MOCK_USER); // Default demo user preloaded on initial demo visit
    }
    return () => {};
  }
};
