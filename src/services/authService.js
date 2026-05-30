import { db } from './firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

// Generate unique auth state token
export const generateStateToken = () => {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

// Check if auth session exists (bot saved it after user clicked Start)
export const checkAuthSession = async (token) => {
  const sessionDoc = await getDoc(doc(db, 'auth_sessions', token));
  if (!sessionDoc.exists()) return null;
  return sessionDoc.data(); // { telegramId, firstName, lastName, username, chatId }
};

// Delete auth session after successful login
export const deleteAuthSession = async (token) => {
  await deleteDoc(doc(db, 'auth_sessions', token));
};
