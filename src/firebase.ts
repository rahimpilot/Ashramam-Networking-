import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAto1Q5Bq2nHNNecCdsXLkLmpdNR2X_RdI",
  authDomain: "ashramam-network.firebaseapp.com",
  projectId: "ashramam-network",
  storageBucket: "ashramam-network.firebasestorage.app",
  messagingSenderId: "135445089005",
  appId: "1:135445089005:web:e4205845f78ecf99291ae4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enhanced security: Connect to emulators in development for testing security rules
if (process.env.NODE_ENV === 'development' && !auth.app.options.projectId?.includes('demo')) {
  // Uncomment these lines when testing locally with Firebase emulators
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

// Set default persistence to local (keeps user logged in across sessions)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting Firebase persistence:', error);
});

// Helper function to set auth persistence based on user preference
export const setAuthPersistence = async (keepLoggedIn: boolean) => {
  try {
    const persistence = keepLoggedIn ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistence);
    console.log('Firebase persistence set to:', keepLoggedIn ? 'local' : 'session');
  } catch (error) {
    console.error('Error setting auth persistence:', error);
  }
};

// Enhanced security helper functions
export const validateUserAccess = (userId: string, currentUserId: string | null): boolean => {
  if (!currentUserId) return false;
  return userId === currentUserId;
};

export const sanitizeUserInput = (input: string): string => {
  // Remove HTML tags and scripts for XSS prevention
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

// Rate limiting helper
const rateLimitMap = new Map<string, number>();
export const checkRateLimit = (userId: string, maxRequestsPerMinute: number = 60): boolean => {
  const now = Date.now();
  const userRequests = rateLimitMap.get(userId) || 0;
  const oneMinuteAgo = now - 60 * 1000;
  
  // Clean old entries
  rateLimitMap.forEach((timestamp, key) => {
    if (timestamp < oneMinuteAgo) {
      rateLimitMap.delete(key);
    }
  });
  
  if (userRequests >= maxRequestsPerMinute) {
    return false;
  }
  
  rateLimitMap.set(userId, userRequests + 1);
  return true;
};