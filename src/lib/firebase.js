import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase 웹 설정값은 공개되어도 되는 값이에요 (데이터 보호는 firestore.rules 가 담당).
// .env.local 에 값을 넣으면 그 값이 우선 사용됩니다.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAnzq4hc6bYuVI3DpK3HRJ06niXpPlFDos",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mylink-713b0.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mylink-713b0",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mylink-713b0.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "451182722788",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:451182722788:web:c88841e87923d0022bf6f1",
};

// .env.local 이 아직 없으면 앱이 죽지 않고 안내 화면을 보여주도록 표시
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = isFirebaseConfigured
  ? getApps()[0] ?? initializeApp(firebaseConfig)
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = new GoogleAuthProvider();
