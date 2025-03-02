import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_JzGddKAFp7-c6LMR460wwUgNvG7ekOY",
  authDomain: "gradeai-d627f.firebaseapp.com",
  projectId: "gradeai-d627f",
  storageBucket: "gradeai-d627f.firebasestorage.app",
  messagingSenderId: "706151922543",
  appId: "1:706151922543:web:2700f80f4b09516908069a",
  measurementId: "G-KGZQQV8J4C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const database = getFirestore(app);
export const analytics = () => getAnalytics(app);

export default app