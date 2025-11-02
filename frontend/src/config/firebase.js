// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBihukpSoBFphMnUD4bX6gWBC8zVu_76Bs",
  authDomain: "dazzling-being-395413.firebaseapp.com",
  projectId: "dazzling-being-395413",
  storageBucket: "dazzling-being-395413.firebasestorage.app",
  messagingSenderId: "1067678083591",
  appId: "1:1067678083591:web:8baf5d4979ce1dae09d8a2",
  measurementId: "G-GWNVGYWWYB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Configure providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const facebookProvider = new FacebookAuthProvider();

export default app;

