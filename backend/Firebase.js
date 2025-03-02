import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = process.env.NODE_ENV === 'production' ? {
  apiKey: "AIzaSyAiaFktju4t5jIEOS5D1kVdPUjeOVLYpYA",
  authDomain: "mvp-starter-8b994.firebaseapp.com",
  projectId: "mvp-starter-8b994",
  storageBucket: "mvp-starter-8b994.appspot.com",
  messagingSenderId: "1090868381027",
  appId: "1:1090868381027:web:088811e04d5857b1eeff56",
  measurementId: "G-SQG8HKC9DP"
} : {
  apiKey: "AIzaSyAiaFktju4t5jIEOS5D1kVdPUjeOVLYpYA",
  authDomain: "mvp-starter-8b994.firebaseapp.com",
  projectId: "mvp-starter-8b994",
  storageBucket: "mvp-starter-8b994.appspot.com",
  messagingSenderId: "1090868381027",
  appId: "1:1090868381027:web:088811e04d5857b1eeff56",
  measurementId: "G-SQG8HKC9DP"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const database = getFirestore(app);
export const analytics = () => getAnalytics(app);

export default app