import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, Timestamp, onSnapshot, doc, updateDoc } from "firebase/firestore";

// Your web app's Firebase configuration
// These will be loaded from your .env.local file
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA8WH0HQjNN11VBOzS13pfkSeJdEsuGW2I",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "laserart-2eca0.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "laserart-2eca0",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "laserart-2eca0.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "741840583008",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:741840583008:web:51064c8cfe65b74605"
};

// Only initialize if config is provided
let app;
let db: any = null;

try {
    if (firebaseConfig.apiKey) {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
    } else {
        console.warn("Firebase config missing. Running in mock data mode.");
    }
} catch (error) {
    console.error("Firebase initialization error", error);
}

export { db, collection, addDoc, getDocs, query, orderBy, limit, Timestamp, onSnapshot, doc, updateDoc };
