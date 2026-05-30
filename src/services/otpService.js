import { db } from './firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

const BOT_TOKEN = '8999837328:AAHkB-Myx9bjZMpORnXVbrDzcQiS9J-ucgQ';

// Normalize phone → +998XXXXXXXXX (no spaces)
function normalizePhone(phone) {
  return phone.replace(/\s/g, '');
}

// Generate OTP and save to Firestore (otps/{phone})
export const generateAndStoreOTP = async (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  const normalized = normalizePhone(phone);

  await setDoc(doc(db, 'otps', normalized), {
    otp,
    expiresAt,
    phone: normalized,
    createdAt: Date.now()
  });

  return otp;
};

// Get user's Telegram chatId from Firestore (users/{phone})
export const getUserChatId = async (phone) => {
  const normalized = normalizePhone(phone);
  const userDoc = await getDoc(doc(db, 'users', normalized));
  if (!userDoc.exists()) return null;
  return userDoc.data().chatId || null;
};

// Send OTP via Telegram Bot API directly to user's chat
export const sendOTPviaTelegram = async (chatId, otp) => {
  const message =
    `🔐 *Lumiere tasdiqlash kodi:*\n\n` +
    `*${otp}*\n\n` +
    `⏱ Kod 5 daqiqa ichida amal qiladi\\.\n` +
    `🔒 Kodni hech kimga bermang\\.`;

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'MarkdownV2'
    })
  });
  return res.json();
};

// Verify OTP entered by user
export const verifyOTP = async (phone, enteredOtp) => {
  const normalized = normalizePhone(phone);
  const otpRef = doc(db, 'otps', normalized);
  const otpDoc = await getDoc(otpRef);

  if (!otpDoc.exists()) return { success: false, reason: 'not_found' };

  const { otp, expiresAt } = otpDoc.data();

  if (Date.now() > expiresAt) {
    await deleteDoc(otpRef);
    return { success: false, reason: 'expired' };
  }

  if (otp === enteredOtp) {
    await deleteDoc(otpRef);
    return { success: true };
  }

  return { success: false, reason: 'wrong_code' };
};
