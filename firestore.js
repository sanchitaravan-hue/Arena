import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { MOCK_USER } from './auth';
import { INITIAL_PLACEMENT_DRIVES, INITIAL_STUDENTS_LIST } from '../data/placementDrivesData';

// Firestore collection identifiers
const COLLECTIONS = {
  USERS: 'users',
  DRIVES: 'placement_drives',
  APPLICATIONS: 'drive_applications',
  GD_SESSIONS: 'gd_sessions',
  ASSESSMENTS: 'assessment_results',
};

// Local storage backup keys for offline & instant mock testing
const STORAGE_KEYS = {
  USER_SESSION: 'arena_user_session',
  DRIVES: 'arena_placement_drives',
  APPLICATIONS: 'arena_drive_applications',
  STUDENTS: 'arena_students_list',
  GD_SESSIONS: 'arena_gd_sessions',
  ASSESSMENTS: 'arena_assessments',
};

// Initializer helper for local storage
const getOrInitLocal = (key, defaultData) => {
  const existing = localStorage.getItem(key);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(key, JSON.stringify(defaultData));
  return defaultData;
};

// ==========================================
// 1. USER & STUDENT MANAGEMENT
// ==========================================

export const createFirestoreUserDocument = async (userProfile) => {
  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userProfile.uid);
      await setDoc(userRef, userProfile, { merge: true });
      return true;
    } catch (error) {
      console.error('Error creating Firestore user document:', error);
      return false;
    }
  } else {
    localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(userProfile));
    // also update student list
    const students = getOrInitLocal(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS_LIST);
    const idx = students.findIndex((s) => s.uid === userProfile.uid);
    if (idx >= 0) {
      students[idx] = { ...students[idx], ...userProfile };
    } else {
      students.push(userProfile);
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    return true;
  }
};

export const getFirestoreUserDocument = async (uid) => {
  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching Firestore user document:', error);
      return null;
    }
  } else {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
    return stored ? JSON.parse(stored) : MOCK_USER;
  }
};

export const updateFirestoreUserDocument = async (uid, updateFields) => {
  const updatedPayload = {
    ...updateFields,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      await updateDoc(userRef, updatedPayload);
      return true;
    } catch (error) {
      console.error('Error updating Firestore user document:', error);
      return false;
    }
  } else {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
    const currentUser = stored ? JSON.parse(stored) : MOCK_USER;
    const mergedUser = { ...currentUser, ...updatedPayload };
    localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(mergedUser));

    // Keep students list in sync
    const students = getOrInitLocal(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS_LIST);
    const idx = students.findIndex((s) => s.uid === uid);
    if (idx >= 0) {
      students[idx] = { ...students[idx], ...updatedPayload };
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    }
    return mergedUser;
  }
};

export const getAllStudents = async () => {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTIONS.USERS);
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
      }
    } catch (err) {
      console.warn('Error fetching students from Firestore, falling back to local:', err);
    }
  }
  return getOrInitLocal(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS_LIST);
};

export const updateStudentStatus = async (uid, newStatus) => {
  await updateFirestoreUserDocument(uid, { status: newStatus });
  const students = getOrInitLocal(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS_LIST);
  const updated = students.map((s) => (s.uid === uid ? { ...s, status: newStatus } : s));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
  return updated;
};

// ==========================================
// 2. PLACEMENT DRIVES (HOST & MANAGE)
// ==========================================

export const getPlacementDrives = async () => {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTIONS.DRIVES);
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (err) {
      console.warn('Firestore drives fetch fallback to local:', err);
    }
  }
  // Ensure seed drives are always present in local storage
  const stored = getOrInitLocal(STORAGE_KEYS.DRIVES, INITIAL_PLACEMENT_DRIVES);
  if (!stored || stored.length === 0) {
    localStorage.setItem(STORAGE_KEYS.DRIVES, JSON.stringify(INITIAL_PLACEMENT_DRIVES));
    return [...INITIAL_PLACEMENT_DRIVES];
  }
  // Merge any missing seed drives (by id) so they're always visible
  const storedIds = new Set(stored.map((d) => d.id));
  const missing = INITIAL_PLACEMENT_DRIVES.filter((d) => !storedIds.has(d.id));
  if (missing.length > 0) {
    const merged = [...stored, ...missing];
    localStorage.setItem(STORAGE_KEYS.DRIVES, JSON.stringify(merged));
    return merged;
  }
  return stored;
};

export const createPlacementDrive = async (driveData) => {
  const newDrive = {
    ...driveData,
    id: driveData.id || `drive_${Date.now()}`,
    appliedCount: 0,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, COLLECTIONS.DRIVES, newDrive.id);
      await setDoc(ref, newDrive);
    } catch (err) {
      console.warn('Firestore drive creation error:', err);
    }
  }

  // Always update local cache
  const list = getOrInitLocal(STORAGE_KEYS.DRIVES, INITIAL_PLACEMENT_DRIVES);
  const updated = [newDrive, ...list];
  localStorage.setItem(STORAGE_KEYS.DRIVES, JSON.stringify(updated));
  return newDrive;
};

export const updatePlacementDrive = async (driveId, updatedFields) => {
  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, COLLECTIONS.DRIVES, driveId);
      await updateDoc(ref, { ...updatedFields, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.warn('Firestore update drive error:', err);
    }
  }

  const list = getOrInitLocal(STORAGE_KEYS.DRIVES, INITIAL_PLACEMENT_DRIVES);
  const updated = list.map((d) => (d.id === driveId ? { ...d, ...updatedFields } : d));
  localStorage.setItem(STORAGE_KEYS.DRIVES, JSON.stringify(updated));
  return updated;
};

export const deletePlacementDrive = async (driveId) => {
  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, COLLECTIONS.DRIVES, driveId);
      await deleteDoc(ref);
    } catch (err) {
      console.warn('Firestore delete drive error:', err);
    }
  }

  const list = getOrInitLocal(STORAGE_KEYS.DRIVES, INITIAL_PLACEMENT_DRIVES);
  const updated = list.filter((d) => d.id !== driveId);
  localStorage.setItem(STORAGE_KEYS.DRIVES, JSON.stringify(updated));
  return updated;
};

// ==========================================
// 3. DRIVE APPLICATIONS (STUDENT SIDE & ADMIN)
// ==========================================

export const applyForPlacementDrive = async ({ driveId, company, role, userProfile }) => {
  const application = {
    id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    driveId,
    company,
    role,
    studentId: userProfile?.uid || 'guest_user',
    studentName: userProfile?.name || 'Applicant',
    studentEmail: userProfile?.email || '',
    college: userProfile?.college || '',
    branch: userProfile?.branch || '',
    cgpa: userProfile?.cgpa || 8.2,
    readinessScore: userProfile?.placementReadinessScore || 78,
    status: 'Application Submitted',
    appliedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, COLLECTIONS.APPLICATIONS, application.id);
      await setDoc(ref, application);
    } catch (err) {
      console.warn('Firestore apply error:', err);
    }
  }

  // Update local applications
  const existingApps = getOrInitLocal(STORAGE_KEYS.APPLICATIONS, []);
  // check if already applied
  const already = existingApps.find(
    (a) => a.driveId === driveId && a.studentId === application.studentId
  );
  if (!already) {
    existingApps.unshift(application);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(existingApps));

    // Increment appliedCount on drive
    const drives = getOrInitLocal(STORAGE_KEYS.DRIVES, INITIAL_PLACEMENT_DRIVES);
    const updatedDrives = drives.map((d) =>
      d.id === driveId ? { ...d, appliedCount: (d.appliedCount || 0) + 1 } : d
    );
    localStorage.setItem(STORAGE_KEYS.DRIVES, JSON.stringify(updatedDrives));

    // Reactive sync: ensure student is present in registered students roster with updated status
    const students = getOrInitLocal(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS_LIST);
    const sIdx = students.findIndex((s) => s.uid === application.studentId);
    if (sIdx >= 0) {
      students[sIdx] = {
        ...students[sIdx],
        status: 'Eligible & Shortlisted',
        appliedDrivesCount: (students[sIdx].appliedDrivesCount || 0) + 1,
        latestAppliedCompany: company,
        latestAppliedRole: role,
        updatedAt: new Date().toISOString(),
      };
    } else {
      students.unshift({
        uid: application.studentId,
        name: application.studentName,
        email: application.studentEmail,
        college: application.college || 'Engineering Institute',
        branch: application.branch || 'Computer Science & Engineering',
        cgpa: application.cgpa || 8.5,
        placementReadinessScore: application.readinessScore || 78,
        targetRole: role,
        status: 'Eligible & Shortlisted',
        appliedDrivesCount: 1,
        latestAppliedCompany: company,
        latestAppliedRole: role,
        updatedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }

  return application;
};

export const getStudentApplications = async (studentId) => {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTIONS.APPLICATIONS);
      const q = query(colRef, where('studentId', '==', studentId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (err) {
      console.warn('Firestore get student apps error:', err);
    }
  }

  const existingApps = getOrInitLocal(STORAGE_KEYS.APPLICATIONS, []);
  return existingApps.filter((a) => a.studentId === studentId);
};

export const getAllDriveApplications = async () => {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTIONS.APPLICATIONS);
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (err) {
      console.warn('Firestore get all apps error:', err);
    }
  }

  return getOrInitLocal(STORAGE_KEYS.APPLICATIONS, [
    {
      id: 'app_sample_1',
      driveId: 'drive-google-2026',
      company: 'Google',
      role: 'Software Development Engineer 1 (SDE-1)',
      studentId: 'arena_demo_user_101',
      studentName: 'Alex Rivera',
      studentEmail: 'alex.rivera@arena.edu',
      college: 'National Institute of Technology (NIT)',
      branch: 'Computer Science & Engineering',
      cgpa: 8.8,
      readinessScore: 84,
      status: 'Shortlisted for OA',
      appliedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'app_sample_2',
      driveId: 'drive-microsoft-2026',
      company: 'Microsoft',
      role: 'Software Engineer - Cloud & AI',
      studentId: 'arena_demo_user_101',
      studentName: 'Alex Rivera',
      studentEmail: 'alex.rivera@arena.edu',
      college: 'National Institute of Technology (NIT)',
      branch: 'Computer Science & Engineering',
      cgpa: 8.8,
      readinessScore: 84,
      status: 'Interview Scheduled',
      appliedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
  ]);
};

export const updateApplicationStatus = async (appId, newStatus) => {
  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, COLLECTIONS.APPLICATIONS, appId);
      await updateDoc(ref, { status: newStatus, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.warn('Firestore update application status error:', err);
    }
  }

  const existingApps = getOrInitLocal(STORAGE_KEYS.APPLICATIONS, []);
  const updated = existingApps.map((a) => (a.id === appId ? { ...a, status: newStatus } : a));
  localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated));
  return updated;
};

// ==========================================
// 4. GROUP DISCUSSION SESSIONS
// ==========================================

export const saveGDSession = async (sessionData) => {
  const session = {
    id: `gd_${Date.now()}`,
    ...sessionData,
    savedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, COLLECTIONS.GD_SESSIONS, session.id);
      await setDoc(ref, session);
    } catch (err) {
      console.warn('Firestore GD save error:', err);
    }
  }

  const list = getOrInitLocal(STORAGE_KEYS.GD_SESSIONS, []);
  list.unshift(session);
  localStorage.setItem(STORAGE_KEYS.GD_SESSIONS, JSON.stringify(list));
  return session;
};

export const getUserGDSessions = async (userId) => {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTIONS.GD_SESSIONS);
      const q = query(colRef, where('userId', '==', userId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (err) {
      console.warn('Firestore fetch GD sessions error:', err);
    }
  }
  const list = getOrInitLocal(STORAGE_KEYS.GD_SESSIONS, []);
  return list.filter((s) => s.userId === userId);
};

// ==========================================
// 5. COMPREHENSIVE ASSESSMENT EVALUATIONS
// ==========================================

export const saveAssessmentResult = async (assessmentResult) => {
  const record = {
    id: `assess_${Date.now()}`,
    ...assessmentResult,
    completedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const ref = doc(db, COLLECTIONS.ASSESSMENTS, record.id);
      await setDoc(ref, record);
    } catch (err) {
      console.warn('Firestore assessment save error:', err);
    }
  }

  const list = getOrInitLocal(STORAGE_KEYS.ASSESSMENTS, []);
  list.unshift(record);
  localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(list));
  return record;
};

export const getUserAssessmentResults = async (userId) => {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTIONS.ASSESSMENTS);
      const q = query(colRef, where('userId', '==', userId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (err) {
      console.warn('Firestore fetch assessments error:', err);
    }
  }
  const list = getOrInitLocal(STORAGE_KEYS.ASSESSMENTS, []);
  return list.filter((a) => a.userId === userId);
};
