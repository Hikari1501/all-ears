import { UserProfile, UserRole } from '../types';
import {
  firebaseAuth,
  firestoreDb,
  isLiveFirebaseConfigured
} from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CURRENT_USER_KEY = 'all_ears_current_user';

export const DEMO_TEACHER: UserProfile = {
  uid: 'teacher-eleanor-vance',
  email: 'eleanor.vance@allears.edu',
  displayName: 'Prof. Eleanor Vance',
  role: 'teacher',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
  createdAt: new Date().toISOString()
};

export const DEMO_STUDENT_1: UserProfile = {
  uid: 'student-alex-smith',
  email: 'alex.smith@student.edu',
  displayName: 'Alex Smith',
  role: 'student',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
  createdAt: new Date().toISOString()
};

export const DEMO_STUDENT_2: UserProfile = {
  uid: 'student-emma-watson',
  email: 'emma.w@student.edu',
  displayName: 'Emma Watson',
  role: 'student',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  createdAt: new Date().toISOString()
};

let currentUserCache: UserProfile | null = null;
const authListeners: ((user: UserProfile | null) => void)[] = [];

// Initialize from localStorage or default to teacher demo
function initAuth() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      currentUserCache = JSON.parse(raw);
    } else {
      currentUserCache = DEMO_TEACHER;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(DEMO_TEACHER));
    }
  } catch (e) {
    currentUserCache = DEMO_TEACHER;
  }
}
initAuth();

function notifyListeners() {
  authListeners.forEach(cb => cb(currentUserCache));
}

export function getCurrentUser(): UserProfile | null {
  return currentUserCache;
}

export function subscribeToAuth(callback: (user: UserProfile | null) => void): () => void {
  authListeners.push(callback);
  callback(currentUserCache);

  // If live Firebase Auth is configured, also listen to official auth state
  let unsubscribeFb: (() => void) | null = null;
  if (isLiveFirebaseConfigured && firebaseAuth) {
    unsubscribeFb = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      if (fbUser && firestoreDb) {
        try {
          const userDoc = await getDoc(doc(firestoreDb, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            currentUserCache = data;
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));
            notifyListeners();
          }
        } catch (e) {
          console.warn('Could not fetch Firestore user profile:', e);
        }
      }
    });
  }

  return () => {
    const idx = authListeners.indexOf(callback);
    if (idx !== -1) authListeners.splice(idx, 1);
    if (unsubscribeFb) unsubscribeFb();
  };
}

export async function loginWithEmail(email: string, role: UserRole = 'student'): Promise<UserProfile> {
  if (isLiveFirebaseConfigured && firebaseAuth) {
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, 'password123');
      if (firestoreDb) {
        const uDoc = await getDoc(doc(firestoreDb, 'users', cred.user.uid));
        if (uDoc.exists()) {
          const profile = uDoc.data() as UserProfile;
          currentUserCache = profile;
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
          notifyListeners();
          return profile;
        }
      }
    } catch (err) {
      console.warn('Firebase login failed or fallback requested:', err);
    }
  }

  // Fallback / instant login
  const name = email.split('@')[0].replace(/[._]/g, ' ');
  const profile: UserProfile = {
    uid: `user-${Date.now().toString(36)}`,
    email,
    displayName: name.charAt(0).toUpperCase() + name.slice(1),
    role,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
    createdAt: new Date().toISOString()
  };

  currentUserCache = profile;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  notifyListeners();
  return profile;
}

export function switchDemoUser(profile: UserProfile): void {
  currentUserCache = profile;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  notifyListeners();
}

export async function logout(): Promise<void> {
  if (isLiveFirebaseConfigured && firebaseAuth) {
    try {
      await fbSignOut(firebaseAuth);
    } catch (e) {
      // ignore
    }
  }
  currentUserCache = null;
  localStorage.removeItem(CURRENT_USER_KEY);
  notifyListeners();
}
