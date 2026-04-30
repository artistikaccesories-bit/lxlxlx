import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, getDocs,
  query, orderBy, limit, Timestamp, onSnapshot, where,
  doc, updateDoc, deleteDoc, setDoc, getDoc
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: any;
let db: any = null;
let storage: any = null;
let auth: any = null;

try {
  if (firebaseConfig.apiKey) {
    console.log("Firebase: Initializing for " + firebaseConfig.projectId);
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
  } else {
    console.error("Firebase: Config missing API Key! Check your environment variables.");
  }
} catch (error) {
  console.error("Firebase: Initialization failed", error);
}

export {
  db, storage, collection, addDoc, getDocs, query, orderBy,
  limit, Timestamp, onSnapshot, doc, updateDoc, deleteDoc, setDoc, getDoc,
  where,
  ref, uploadBytes, getDownloadURL, uploadBytesResumable,
  auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword
};
