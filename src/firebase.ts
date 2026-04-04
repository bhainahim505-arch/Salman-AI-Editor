import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Helper for Google Login
export const signIn = () => signInWithPopup(auth, googleProvider);
export const logOut = () => auth.signOut();

// Error handling for Firestore
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  // Check for "client is offline" which indicates config issues
  if (errInfo.error.includes('the client is offline') || errInfo.error.includes('unavailable')) {
    console.error("CRITICAL: Firestore is unreachable. Check firebase-applet-config.json and project settings.");
  }
  
  throw new Error(JSON.stringify(errInfo));
}

// Diagnostic test for Firestore connection
export async function testConnection() {
  try {
    console.log("Testing Firestore Connection...");
    // Try to get a non-existent doc from server to force a network check
    await getDocFromServer(doc(db, '_diagnostics', 'connection'));
    console.log("Firestore Connection: OK 🦾");
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable'))) {
      console.error("CRITICAL: Firestore is unreachable. This usually means the configuration in firebase-applet-config.json is incorrect or the database is not provisioned.");
    } else {
      console.warn("Firestore Connection Test (expected failure if doc missing, but connection is alive):", error);
    }
  }
}
