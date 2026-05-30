import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAACRi9UwWLY3ywH-t9RMvtTzV5nGKjL34",
  authDomain: "lumiere-fd65f.firebaseapp.com",
  projectId: "lumiere-fd65f",
  storageBucket: "lumiere-fd65f.firebasestorage.app",
  messagingSenderId: "49687191649",
  appId: "1:49687191649:web:8257fbe0cfd96bb8baca20",
  measurementId: "G-007GQWW4BQ"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
