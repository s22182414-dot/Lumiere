/**
 * Eskiz.uz SMS API Integration Service
 * Handles token generation, caching, and sending OTP messages to real Uzbek phone numbers.
 */
class SmsService {
  constructor() {
    this.baseUrl = 'https://notify.eskiz.uz/api';
  }

  /**
   * Retrieves saved Eskiz credentials from localStorage
   */
  getCredentials() {
    const saved = localStorage.getItem('sms_eskiz_credentials');
    return saved ? JSON.parse(saved) : { email: 'forprosunnatillo@gmail.com', password: 'ok_142_142' };
  }

  /**
   * Saves Eskiz credentials to localStorage
   */
  saveCredentials(email, password) {
    localStorage.setItem('sms_eskiz_credentials', JSON.stringify({ email, password }));
    // Clear cached token so it gets re-fetched on next login
    localStorage.removeItem('sms_eskiz_token');
    localStorage.removeItem('sms_eskiz_token_expiry');
  }

  /**
   * Clears all saved credentials
   */
  clearCredentials() {
    localStorage.removeItem('sms_eskiz_credentials');
    localStorage.removeItem('sms_eskiz_token');
    localStorage.removeItem('sms_eskiz_token_expiry');
  }

  /**
   * Retrieves or fetches a valid JWT token from Eskiz
   */
  async getValidToken(email, password) {
    const cachedToken = localStorage.getItem('sms_eskiz_token');
    const expiry = localStorage.getItem('sms_eskiz_token_expiry');

    // Token lasts 30 days, we'll refresh if close to expiry
    if (cachedToken && expiry && Date.now() < Number(expiry)) {
      return cachedToken;
    }

    try {
      // Eskiz requires multipart/form-data or urlencoded/json depending on version.
      // Usually POST to notify.eskiz.uz/api/auth/login
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Eskiz server validation error (${response.status})`);
      }

      const resData = await response.json();
      const token = resData.data?.token || resData.token;

      if (!token) {
        throw new Error("API Login was successful, but no JWT token was returned by Eskiz.");
      }

      // Save token and set 25 days expiry
      localStorage.setItem('sms_eskiz_token', token);
      localStorage.setItem('sms_eskiz_token_expiry', (Date.now() + 25 * 24 * 60 * 60 * 1000).toString());

      return token;
    } catch (err) {
      console.error("Eskiz Login Authentication failed:", err);
      throw new Error(`Eskiz.uz tizimiga ulanishda xatolik: ${err.message}`);
    }
  }

  /**
   * Sends a real SMS to a mobile phone number via Eskiz
   * @param {string} rawPhoneDigits - e.g. "901234567" or "998901234567"
   * @param {string} messageText - Custom formatted SMS message to send
   */
  async sendOtp(rawPhoneDigits, messageText) {
    const { email, password } = this.getCredentials();

    if (!email || !password) {
      return {
        success: false,
        error: "Eskiz.uz SMS sozlamalari kiritilmagan. SMS sozlamalarini to'ldiring."
      };
    }

    // Clean phone number (must be 998XXXXXXXXX format)
    let cleanPhone = rawPhoneDigits.replace(/\D/g, '');
    if (!cleanPhone.startsWith('998')) {
      cleanPhone = '998' + cleanPhone;
    }

    if (cleanPhone.length !== 12) {
      return {
        success: false,
        error: "Telefon raqami noto'g'ri formatda. Faqat O'zbekiston raqamlari qo'llab-quvvatlanadi."
      };
    }

    try {
      // 1. Get token
      const token = await this.getValidToken(email, password);

      // 2. Send message
      // Eskiz POST notify.eskiz.uz/api/message/sms/send
      const formData = new FormData();
      formData.append('mobile_phone', cleanPhone);
      formData.append('message', messageText);
      formData.append('from', '4546'); // Standard testing alpha name

      const response = await fetch(`${this.baseUrl}/message/sms/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const resData = await response.json();

      if (!response.ok || (resData.status !== 'success' && resData.status !== 'waiting')) {
        throw new Error(resData.message || `SMS jo'natishda xatolik yuz berdi (${response.status})`);
      }

      return {
        success: true,
        messageId: resData.id || (resData.data && resData.data.id)
      };
    } catch (err) {
      console.error("Real SMS sending failed via Eskiz.uz:", err);
      return {
        success: false,
        error: err.message
      };
    }
  }
}

export const smsService = new SmsService();
