import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, ShieldCheck, CreditCard, Truck } from 'lucide-react';
import LoginModal from '../components/LoginModal';
import { formatPhoneUz } from '../utils/helpers';


const Checkout = () => {
  const navigate = useNavigate();
  const { cart: allCart, clearSelectedFromCart } = useCart();
  const cart = allCart.filter(item => item.selected !== false);
  const orderPlaced = useRef(false);
  const getCheckoutTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Checkout form states
  const [firstName, setFirstName] = useState(() => localStorage.getItem('user_name') || '');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState(() => formatPhoneUz(localStorage.getItem('user_phone') || ''));
  const [city, setCity] = useState(() => localStorage.getItem('user_city') || 'Toshkent');
  const [address, setAddress] = useState(() => localStorage.getItem('user_address') || '');
  const [paymentMethod, setPaymentMethod] = useState('telegram');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 💳 Real Online Payment Simulation States
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardBrand, setCardBrand] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const [createdOrderId, setCreatedOrderId] = useState('');
  const [clickPayType, setClickPayType] = useState('wallet'); // 'wallet' or 'card'
  const [clickWalletPhone, setClickWalletPhone] = useState('');
  const [customAlert, setCustomAlert] = useState({ show: false, message: '', type: 'info' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);
  const showAlert = (message, type = 'info') => {
    setCustomAlert({ show: true, message, type });
  };


  useEffect(() => {
    if (phone && !clickWalletPhone) {
      setClickWalletPhone(phone);
    }
  }, [phone]);





  const sendVerificationCode = async () => {
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    setGeneratedOtp(code);
    setOtpTimer(60);

    const cleanCardNum = cardNumber.replace(/\s+/g, '');
    const maskedCard = cleanCardNum ? `${cleanCardNum.substring(0, 4)}********${cleanCardNum.substring(12)}` : 'CARD';

    let brand = '';
    if (paymentMethod === 'click' && clickPayType === 'wallet') {
      brand = 'Click.uz';
    } else {
      brand = cardBrand ? cardBrand.toUpperCase() : (cleanCardNum.startsWith('9860') ? 'HUMO' : 'UZCARD');
    }

    const messageText = paymentMethod === 'click' && clickPayType === 'wallet'
      ? `Click.uz: To'lovni tasdiqlash kodi: ${code}. Summa: ${formatPrice(getCheckoutTotal())}. Kodni hech kimga bermang!`
      : `${brand}: Karta ${maskedCard} dan to'lovni tasdiqlash kodi: ${code}. Summa: ${formatPrice(getCheckoutTotal())}.`;

    const telegramId = localStorage.getItem('user_telegram_id');
    if (telegramId && telegramId !== 'offline') {
      try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramId, message: messageText })
        });
      } catch (err) {
        console.error('OTP yuborishda xato:', err);
      }
    }
  };

  useEffect(() => {
    let interval = null;
    if (otpStep && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, otpTimer]);

  const detectCardBrand = (number) => {
    const clean = number.replace(/\s+/g, '');
    if (clean.startsWith('8600') || clean.startsWith('5614')) return 'uzcard';
    if (clean.startsWith('9860')) return 'humo';
    if (clean.startsWith('4')) return 'visa';
    if (clean.startsWith('51') || clean.startsWith('52') || clean.startsWith('53') || clean.startsWith('54') || clean.startsWith('55')) return 'mastercard';
    return '';
  };

  const handleCardNumberChange = (val) => {
    const clean = val.replace(/\D/g, '').substring(0, 16);
    const formatted = clean.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
    setCardBrand(detectCardBrand(clean));
  };

  const handleExpiryChange = (val) => {
    const clean = val.replace(/\D/g, '').substring(0, 4);
    if (clean.length >= 2) {
      setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2)}`);
    } else {
      setCardExpiry(clean);
    }
  };

  const handleCvvChange = (val) => {
    const clean = val.replace(/\D/g, '').substring(0, 3);
    setCardCvv(clean);
  };

  useEffect(() => {
    // If cart is empty, redirect to home page, unless order was successfully placed!
    if (cart.length === 0 && !orderPlaced.current) {
      navigate('/');
    }
  }, [cart, navigate]);

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!firstName || !phone || !address) {
      showAlert("Iltimos, barcha majburiy maydonlarni to'ldiring!", "error");
      return;
    }

    const cleanPhoneDigits = phone.replace(/[^\d]/g, '');
    if (cleanPhoneDigits.length < 12) {
      showAlert("Telefon raqami noto'g'ri! Iltimos, to'liq kiriting: +998 xx xxx xx xx", "error");
      return;
    }

    if (localStorage.getItem('user_logged_in') !== 'true') {
      setShowLoginModal(true);
      return;
    }

    if (paymentMethod === 'click' || paymentMethod === 'payme') {
      setShowCardModal(true);
      setCardHolder(`${firstName} ${lastName}`.trim().toUpperCase() || 'KARTA EGASI');
      return;
    }

    setIsSubmitting(true);
    const telegramId = localStorage.getItem('user_telegram_id') || 'offline';

    const orderData = {
      telegramId,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity
      })),
      totalPrice: getCheckoutTotal(),
      customerDetails: {
        firstName,
        lastName,
        phone,
        city,
        address,
        paymentMethod
      }
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const savedOrder = await res.json();
        // Save phone, city and address to localStorage so they are remembered for next checkouts
        localStorage.setItem('user_phone', phone);
        localStorage.setItem('user_city', city);
        localStorage.setItem('user_address', address);
        window.dispatchEvent(new Event('storage'));

        // Save to cart history local storage cache
        try {
          const savedCart = localStorage.getItem('cart');
          let cartHistory = savedCart ? JSON.parse(savedCart) : [];
          cartHistory = [...cart.map(item => ({ ...item, date: new Date().toLocaleDateString('uz-UZ'), orderNumber: savedOrder.orderNumber })), ...cartHistory];
          localStorage.setItem('cart', JSON.stringify(cartHistory));
        } catch (err) { }

        orderPlaced.current = true;
        setPlacedOrderDetails(savedOrder);
        clearSelectedFromCart();
        setShowSuccessModal(true);
      } else {
        showAlert("Buyurtmangizni rasmiylashtirishda xatolik yuz berdi. Qayta urinib ko'ring.", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("MongoDB API serveriga ulanib bo'lmadi. Backend ishlayotganligini tekshiring.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    
    // Validations based on Payme or Click type
    if (paymentMethod === 'payme' || (paymentMethod === 'click' && clickPayType === 'card')) {
      const cleanNum = cardNumber.replace(/\s+/g, '');
      if (cleanNum.length !== 16) {
        showAlert("Karta raqami 16 ta raqamdan iborat bo'lishi kerak!", "error");
        return;
      }
      const cleanExp = cardExpiry.replace('/', '');
      if (cleanExp.length !== 4) {
        showAlert("Amal qilish muddati noto'g'ri (MM/YY)!", "error");
        return;
      }
      if ((cardBrand === 'visa' || cardBrand === 'mastercard') && cardCvv.length !== 3) {
        showAlert("CVV/CVC kodi 3 ta raqam bo'lishi shart!", "error");
        return;
      }
    } else if (paymentMethod === 'click' && clickPayType === 'wallet') {
      const cleanWalletPhoneDigits = clickWalletPhone.replace(/[^\d]/g, '');
      if (cleanWalletPhoneDigits.length < 12) {
        showAlert("Iltimos, Click hamyonga ulangan telefon raqamingizni to'liq kiriting: +998 xx xxx xx xx", "error");
        return;
      }
    }

    setIsProcessingPayment(true);
    const telegramId = localStorage.getItem('user_telegram_id') || 'offline';

    // 1. FIRST create order in MongoDB as "Kutilmoqda" (Pending)
    const orderData = {
      telegramId,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity
      })),
      totalPrice: getCheckoutTotal(),
      customerDetails: {
        firstName,
        lastName,
        phone,
        city,
        address,
        paymentMethod: `online (${paymentMethod.toUpperCase()})`
      },
      status: "Kutilmoqda"
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const savedOrder = await res.json();
        setCreatedOrderId(savedOrder._id);
        setPlacedOrderDetails(savedOrder);

        // 2. NOW call Click/Payme Prepare Webhooks to verify amount/account details
        if (paymentMethod === 'click') {
          // Call Click POST /api/payment/click (Action = 0: Prepare)
          const clickRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              click_trans_id: Math.floor(100000 + Math.random() * 900000),
              service_id: 22446,
              click_paydoc_id: Math.floor(100000 + Math.random() * 900000),
              merchant_trans_id: savedOrder._id,
              amount: savedOrder.totalPrice,
              action: 0, // Prepare
              error: 0,
              error_note: "Success"
            })
          });
          const clickData = await clickRes.json();
          if (clickData.error < 0) {
            throw new Error(`Click validation error: ${clickData.error_note}`);
          }
        } else if (paymentMethod === 'payme') {
          // Call Payme CheckPerformTransaction JSON-RPC method
          const paymeRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/payme`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: Math.floor(100000 + Math.random() * 900000),
              method: 'CheckPerformTransaction',
              params: {
                amount: savedOrder.totalPrice * 100, // Tiyin
                account: { order_id: savedOrder._id }
              }
            })
          });
          const paymeData = await paymeRes.json();
          if (paymeData.error) {
            throw new Error(`Payme validation error: ${paymeData.error.message}`);
          }

          // Trigger Payme CreateTransaction method
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/payme`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: Math.floor(100000 + Math.random() * 900000),
              method: 'CreateTransaction',
              params: {
                id: `payme-trans-${Math.floor(100000 + Math.random() * 900000)}`,
                time: Date.now(),
                amount: savedOrder.totalPrice * 100,
                account: { order_id: savedOrder._id }
              }
            })
          });
        }

        // 3. Trigger OTP Delivery SMS
        await sendVerificationCode();
        setOtpStep(true);
      } else {
        showAlert("Buyurtma yozishda muammo yuz berdi. Qayta urinib ko'ring.", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert(`To'lov markazi ulanish xatosi: ${err.message}`, "error");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 5) {
      showAlert("SMS tasdiqlash kodi 5 ta raqamdan iborat!", "error");
      return;
    }

    if (otpCode !== generatedOtp) {
      showAlert("Tasdiqlash kodi noto'g'ri! Iltimos, qayta tekshirib to'g'ri kodni kiriting.", "error");
      return;
    }

    setIsProcessingPayment(true);

    try {
      // 4. NOW call Click/Payme CONFIRM (Action = 1: Complete or PerformTransaction) Webhook
      if (paymentMethod === 'click') {
        const clickRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/click`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            click_trans_id: Math.floor(100000 + Math.random() * 900000),
            service_id: 22446,
            click_paydoc_id: Math.floor(100000 + Math.random() * 900000),
            merchant_trans_id: createdOrderId,
            amount: getCheckoutTotal(),
            action: 1, // Complete
            error: 0,
            error_note: "Success"
          })
        });
        const clickData = await clickRes.json();
        if (clickData.error < 0) {
          throw new Error(`Click confirm error: ${clickData.error_note}`);
        }
      } else if (paymentMethod === 'payme') {
        // Trigger Payme PerformTransaction json-rpc API call
        const paymeRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/payme`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'order-id': createdOrderId
          },
          body: JSON.stringify({
            id: Math.floor(100000 + Math.random() * 900000),
            method: 'PerformTransaction',
            params: {
              id: `payme-trans-${Math.floor(100000 + Math.random() * 900000)}`,
              order_id: createdOrderId
            }
          })
        });
        const paymeData = await paymeRes.json();
        if (paymeData.error) {
          throw new Error(`Payme confirm error: ${paymeData.error.message}`);
        }
      }

      // Save phone, city and address to localStorage so they are remembered for next checkouts
      localStorage.setItem('user_phone', phone);
      localStorage.setItem('user_city', city);
      localStorage.setItem('user_address', address);
      window.dispatchEvent(new Event('storage'));

      // Save to cart history local storage cache
      try {
        const savedCart = localStorage.getItem('cart');
        let cartHistory = savedCart ? JSON.parse(savedCart) : [];
        cartHistory = [...cart.map(item => ({ ...item, date: new Date().toLocaleDateString('uz-UZ'), status: "To'langan", orderNumber: placedOrderDetails?.orderNumber })), ...cartHistory];
        localStorage.setItem('cart', JSON.stringify(cartHistory));
      } catch (err) { }

      orderPlaced.current = true;
      clearSelectedFromCart();
      setShowCardModal(false);
      setOtpStep(false);
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setOtpCode('');
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      showAlert(`To'lovni tasdiqlashda xatolik yuz berdi: ${err.message}`, "error");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="checkout-page-wrapper" style={{ backgroundColor: '#fcfcfc', minHeight: '100vh', padding: '1rem', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <style>{`
        .checkout-page-wrapper {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1a1a1a;
          background-color: #f8fafc;
        }
        
        .checkout-container {
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .checkout-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .btn-back-to-cart {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--color-primary);
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn-back-to-cart:hover {
          transform: translateX(-2px);
        }

        .checkout-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.88rem;
          color: #8b96a5;
        }

        .checkout-layout {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 2rem;
        }

        .checkout-section-card {
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid #e6e8eb;
          margin-bottom: 1.5rem;
        }

        .section-title-new {
          font-size: 1.25rem;
          font-weight: 750;
          margin: 0 0 1.5rem 0;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #1a1a1a;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .input-group-new {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 1.25rem;
        }

        .input-group-new label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #4a5568;
        }

        .input-group-new label span {
          color: var(--color-primary);
        }

        .input-new {
          padding: 0.75rem 1rem;
          border: 1px solid #e6e8eb;
          border-radius: 8px;
          font-size: 0.92rem;
          outline: none;
          transition: all 0.2s;
          background-color: #ffffff;
          color: #1a1a1a;
        }

        .input-new:focus {
          border-color: var(--color-primary);
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(255, 51, 102, 0.08);
        }

        .select-new {
          padding: 0.75rem 1rem;
          border: 1px solid #e6e8eb;
          border-radius: 8px;
          font-size: 0.92rem;
          outline: none;
          background-color: #ffffff;
          color: #1a1a1a;
          cursor: pointer;
        }

        .select-new:focus {
          border-color: var(--color-primary);
          background-color: #ffffff;
        }

        /* Payment Option Selectors */
        .payment-options-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .payment-option-card {
          border: 1px solid #e6e8eb;
          border-radius: 10px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: #ffffff;
        }

        .payment-option-card:hover {
          border-color: #cbd5e1;
        }

        .payment-option-card.selected {
          border-color: var(--color-primary);
          background-color: rgba(255, 51, 102, 0.01);
        }

        .radio-dot-outer {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .payment-option-card.selected .radio-dot-outer {
          border-color: var(--color-primary);
        }

        .radio-dot-inner {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: transparent;
        }

        .payment-option-card.selected .radio-dot-inner {
          background-color: var(--color-primary);
        }

        .payment-option-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .payment-title {
          font-weight: 700;
          font-size: 0.95rem;
        }

        .payment-subtitle {
          font-size: 0.8rem;
          color: #8b8e99;
        }

        /* Order Items list */
        .checkout-items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 220px;
          overflow-y: auto;
          margin-bottom: 1.5rem;
          padding-right: 4px;
        }

        .checkout-item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e6e8eb;
        }

        .checkout-item-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .checkout-item-thumb {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #e6e8eb;
          flex-shrink: 0;
        }

        .checkout-item-details {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .checkout-item-name {
          font-size: 0.88rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .checkout-item-qty {
          font-size: 0.78rem;
          color: #8b8e99;
        }

        .checkout-item-price {
          font-weight: 700;
          font-size: 0.88rem;
          flex-shrink: 0;
        }

        @media (max-width: 900px) {
          .checkout-page-wrapper {
            padding: 0.5rem !important;
          }
          .checkout-layout {
            grid-template-columns: 1fr;
            gap: 1rem !important;
          }
          .form-grid-2 {
            grid-template-columns: 1fr;
            gap: 0.75rem !important;
          }
          .checkout-section-card {
            padding: 1.25rem 1rem !important;
            margin-bottom: 1rem !important;
            border-radius: 10px !important;
          }
          .checkout-header {
            margin-bottom: 0.75rem !important;
          }
          .checkout-breadcrumb {
            display: none;
          }
          .section-title-new {
            font-size: 1.1rem !important;
            margin-bottom: 1rem !important;
          }
          .input-group-new {
            margin-bottom: 0.85rem !important;
            gap: 4px !important;
          }
          .input-new, .select-new {
            padding: 0.65rem 0.85rem !important;
            font-size: 0.88rem !important;
          }
          .payment-option-card {
            padding: 0.85rem !important;
            gap: 10px !important;
            align-items: flex-start !important;
            border-radius: 8px !important;
          }
          .radio-dot-outer {
            margin-top: 3px !important;
          }
          .payment-title {
            font-size: 0.88rem !important;
          }
          .payment-subtitle {
            font-size: 0.75rem !important;
          }
          .checkout-items-list {
            max-height: 160px !important;
            gap: 10px !important;
            margin-bottom: 1rem !important;
          }
          .checkout-item-row {
            gap: 10px !important;
            padding-bottom: 10px !important;
          }
          .checkout-item-name {
            font-size: 0.82rem !important;
          }
        }

        @media (min-width: 901px) {
          .checkout-page-wrapper {
            padding: 2rem 1rem !important;
          }
          .checkout-right-col .checkout-section-card {
            position: sticky;
            top: 100px;
          }
        }

        /* ─── Real Card Payment Gateway Modal & Card Mockup ─── */

        .payment-modal-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100000;
          opacity: 0;
          animation: fadeInModalBackdrop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .payment-modal-card {
          background: #ffffff;
          border: 1px solid #e6e8eb;
          border-radius: 16px;
          width: 92%;
          max-width: 440px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
          overflow: hidden;
          padding: 1.75rem;
          transform: scale(0.9) translateY(20px);
          animation: scaleInModal 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .payment-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding-bottom: 0.75rem;
        }

        .payment-modal-header h3 {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
          color: #1a1a1a;
        }

        .payment-modal-close-btn {
          background: rgba(0, 0, 0, 0.04);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #718096;
          transition: all 0.2s;
        }

        .payment-modal-close-btn:hover {
          background: rgba(255, 51, 102, 0.1);
          color: var(--color-primary);
        }

        /* 3D-styled glassmorphic Card Mockup (Magenta Pink Theme) */
        .credit-card-mockup {
          height: 200px;
          width: 100%;
          border-radius: 12px;
          padding: 1.5rem;
          color: white;
          position: relative;
          box-shadow: 0 10px 25px rgba(255, 51, 102, 0.15);
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.4s ease;
          background: linear-gradient(135deg, #FF3366, #ff7b93);
        }

        .credit-card-mockup.uzcard,
        .credit-card-mockup.humo,
        .credit-card-mockup.visa,
        .credit-card-mockup.mastercard {
          background: linear-gradient(135deg, #FF3366, #ff7b93);
        }

        .card-chip {
          width: 42px;
          height: 30px;
          background: linear-gradient(135deg, #fce881, #cba135);
          border-radius: 6px;
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.4);
          position: relative;
        }

        .card-brand-logo {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          font-weight: 900;
          font-size: 1.35rem;
          font-style: italic;
          letter-spacing: 1px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.15);
          text-transform: uppercase;
        }

        .card-number-display {
          font-family: "Courier New", Courier, monospace;
          font-size: 1.35rem;
          font-weight: bold;
          letter-spacing: 3px;
          word-spacing: 2px;
          margin: 1.25rem 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .card-bottom-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          text-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .card-holder-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.8;
          margin-bottom: 2px;
        }

        .card-holder-value {
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .card-expiry-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.8;
          margin-bottom: 2px;
          text-align: right;
        }

        .card-expiry-value {
          font-size: 0.88rem;
          font-weight: 600;
          letter-spacing: 1px;
          text-align: right;
        }

        @keyframes fadeInModalBackdrop {
          to { opacity: 1; }
        }

        @keyframes scaleInModal {
          to { transform: scale(1) translateY(0); }
        }

        .success-modal-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 2.5rem 2.25rem;
          width: 90%;
          max-width: 520px;
          text-align: center;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12);
          position: relative;
          transform: scale(0.96);
          animation: scaleInModal 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          max-height: 95vh;
          overflow-y: auto;
        }

        .success-modal-buttons {
          display: flex;
          gap: 12px;
        }

        @media (max-width: 480px) {
          .success-modal-card {
            padding: 1.75rem 1.25rem;
            border-radius: 20px;
          }
          .success-modal-buttons {
            flex-direction: column;
            gap: 10px;
          }
          .success-modal-buttons button {
            width: 100% !important;
            padding: 0.8rem !important;
            font-size: 0.88rem !important;
          }
        }
      `}</style>

      <div className="checkout-container">
        
        {/* Breadcrumb & Navigation */}
        <div className="checkout-header">
          <Link to="/cart" className="btn-back-to-cart">
            <ArrowLeft size={18} />
            Savatga qaytish
          </Link>
          <div className="checkout-breadcrumb">
            <span style={{ fontWeight: '600', color: '#1f1f1f' }}>Savat</span>
            <ChevronRight size={14} />
            <span style={{ fontWeight: '700', color: '#FF3366' }}>Rasmiylashtirish</span>
            <ChevronRight size={14} />
            <span>Yakunlash</span>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="checkout-layout">
          
          {/* Left Column: Form Info */}
          <div className="checkout-left-col">
            
            {/* Delivery Info */}
            <div className="checkout-section-card">
              <h2 className="section-title-new">
                <Truck size={20} color="#FF3366" />
                Yetkazib berish ma'lumotlari
              </h2>
              
              <div className="form-grid-2">
                <div className="input-group-new">
                  <label>Ismingiz <span>*</span></label>
                  <input 
                    type="text" 
                    placeholder="Ism" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    required 
                    className="input-new" 
                  />
                </div>
                <div className="input-group-new">
                  <label>Familiyangiz</label>
                  <input 
                    type="text" 
                    placeholder="Familiya" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    className="input-new" 
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="input-group-new">
                  <label>Telefon raqamingiz <span>*</span></label>
                  <input 
                    type="tel" 
                    placeholder="+998 90 123 45 67" 
                    value={phone} 
                    onChange={(e) => {
                      const formatted = formatPhoneUz(e.target.value);
                      setPhone(formatted);
                      localStorage.setItem('user_phone', formatted);
                      window.dispatchEvent(new Event('storage'));
                    }} 
                    required 
                    className="input-new" 
                  />
                </div>
                <div className="input-group-new">
                  <label>Shahar / Viloyat <span>*</span></label>
                  <select 
                    value={city} 
                    onChange={(e) => {
                      setCity(e.target.value);
                      localStorage.setItem('user_city', e.target.value);
                      window.dispatchEvent(new Event('storage'));
                    }} 
                    className="select-new"
                  >
                    <option value="Toshkent">Toshkent</option>
                    <option value="Samarqand">Samarqand</option>
                    <option value="Buxoro">Buxoro</option>
                    <option value="Farg'ona">Farg'ona</option>
                    <option value="Andijon">Andijon</option>
                    <option value="Namangan">Namangan</option>
                    <option value="Qarshi">Qarshi</option>
                    <option value="Nukus">Nukus</option>
                  </select>
                </div>
              </div>

              <div className="input-group-new" style={{ marginBottom: 0 }}>
                <label>Yetkazib berish manzili <span>*</span></label>
                <input 
                  type="text" 
                  placeholder="Tuman, ko'cha, uy / xonadon manzili" 
                  value={address} 
                  onChange={(e) => {
                    setAddress(e.target.value);
                    localStorage.setItem('user_address', e.target.value);
                    window.dispatchEvent(new Event('storage'));
                  }} 
                  required 
                  className="input-new" 
                />
              </div>
            </div>

            {/* To'lov usuli Selector */}
            <div className="checkout-section-card">
              <h2 className="section-title-new">
                <CreditCard size={20} color="#FF3366" />
                To'lov usuli
              </h2>

              <div className="payment-options-container">
                {/* Pay via Telegram */}
                <div 
                  className={`payment-option-card ${paymentMethod === 'telegram' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('telegram')}
                  style={paymentMethod === 'telegram' ? { borderColor: '#0088cc', backgroundColor: 'rgba(0, 136, 204, 0.02)' } : {}}
                >
                  <div className="radio-dot-outer" style={paymentMethod === 'telegram' ? { borderColor: '#0088cc' } : {}}>
                    <div className="radio-dot-inner" style={paymentMethod === 'telegram' ? { backgroundColor: '#0088cc' } : {}}></div>
                  </div>
                  <div className="payment-option-info">
                    <span className="payment-title" style={paymentMethod === 'telegram' ? { color: '#0088cc' } : {}}>💬 Telegram orqali to'lash (Plastik kartaga)</span>
                    <span className="payment-subtitle">
                      Buyurtmani tasdiqlaganingizdan so'ng, botimiz sizga karta raqami va yo'riqnomani yuboradi. To'lov chekini (screenshot) botga yuborishingiz so'raladi.
                    </span>
                  </div>
                </div>


              </div>
            </div>

          </div>

          {/* Right Column: Order Summary Card */}
          <div className="checkout-right-col">
            <div className="checkout-section-card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.25rem', borderBottom: '1px solid #eef0f2', paddingBottom: '0.75rem' }}>
                Xarid yakuni
              </h3>

              {/* Items List */}
              <div className="checkout-items-list">
                {cart.map(item => (
                  <div key={item.id} className="checkout-item-row">
                    <img src={item.image} alt={item.name} className="checkout-item-thumb" />
                    <div className="checkout-item-details">
                      <span className="checkout-item-name">{item.name}</span>
                      <span className="checkout-item-qty">{item.quantity} ta × {formatPrice(item.price)}</span>
                    </div>
                    <span className="checkout-item-price">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#8b96a5', fontSize: '0.88rem' }}>
                <span>Mahsulotlar jami:</span>
                <span style={{ fontWeight: '600', color: '#1f1f1f' }}>{formatPrice(getCheckoutTotal())}</span>
              </div>


              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                borderTop: '1px solid #eef0f2', 
                paddingTop: '1rem', 
                marginBottom: '1.75rem', 
                fontSize: '1.2rem', 
                fontWeight: '800', 
                color: '#FF3366' 
              }}>
                <span>Jami summa:</span>
                <span>{formatPrice(getCheckoutTotal())}</span>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: 'var(--color-primary)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '10px',
                  fontWeight: '750',
                  fontSize: '0.98rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(255, 51, 102, 0.25)',
                  transition: 'background-color 0.2s',
                  opacity: isSubmitting ? 0.75 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting ? (
                  'Buyurtma rasmiylashtirilmoqda...'
                ) : (
                  paymentMethod === 'telegram' ? (
                    <>
                      <ShieldCheck size={18} />
                      Telegram orqali tasdiqlash
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Buyurtmani tasdiqlash
                    </>
                  )
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: '#8b96a5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#00b533" />
                Xavfsiz va kafolatlangan xarid
              </div>
            </div>
          </div>

        </form>
      </div>

      {/* ─── Real-Time Card Payment Gateway Modal Simulation ─── */}
      {showCardModal && (
        <div className="payment-modal-backdrop" onClick={() => {
          if (!isProcessingPayment) {
            setShowCardModal(false);
            setOtpStep(false);
          }
        }}>
          <div className="payment-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="payment-modal-header" style={{
              borderBottom: paymentMethod === 'click' ? '2px solid #0072ff' : '2px solid #00B048',
              paddingBottom: '0.5rem'
            }}>
              <h3 style={{
                color: paymentMethod === 'click' ? '#0072ff' : '#00B048',
                fontWeight: '800'
              }}>
                {otpStep 
                  ? `${paymentMethod.toUpperCase()} Tasdiqlash` 
                  : (paymentMethod === 'click' ? "🔵 Click Gateway" : "🟢 Payme Checkout")}
              </h3>
              <button 
                type="button" 
                className="payment-modal-close-btn" 
                disabled={isProcessingPayment} 
                onClick={() => {
                  setShowCardModal(false);
                  setOtpStep(false);
                }}
              >
                ✕
              </button>
            </div>

            {!otpStep ? (
              <form onSubmit={handleCardSubmit}>
                {/* Click Payment Type Tabs */}
                {paymentMethod === 'click' && (
                  <div style={{
                    display: 'flex',
                    background: 'rgba(0, 0, 0, 0.04)',
                    padding: '4px',
                    borderRadius: '12px',
                    marginBottom: '1.25rem'
                  }}>
                    <button
                      type="button"
                      onClick={() => setClickPayType('wallet')}
                      style={{
                        flex: 1,
                        background: clickPayType === 'wallet' ? '#ffffff' : 'none',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        color: clickPayType === 'wallet' ? '#0072ff' : '#64748b',
                        cursor: 'pointer',
                        boxShadow: clickPayType === 'wallet' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      📱 Click Wallet (Telefon)
                    </button>
                    <button
                      type="button"
                      onClick={() => setClickPayType('card')}
                      style={{
                        flex: 1,
                        background: clickPayType === 'card' ? '#ffffff' : 'none',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        color: clickPayType === 'card' ? '#0072ff' : '#64748b',
                        cursor: 'pointer',
                        boxShadow: clickPayType === 'card' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      💳 Uzcard / Humo / Visa
                    </button>
                  </div>
                )}

                {/* Credit Card Mockup (For Payme, or Click Card pay type) */}
                {(paymentMethod === 'payme' || (paymentMethod === 'click' && clickPayType === 'card')) && (
                  <div className={`credit-card-mockup ${cardBrand}`} style={
                    paymentMethod === 'click'
                      ? { background: 'linear-gradient(135deg, #0052d4, #4364f7)' }
                      : { background: 'linear-gradient(135deg, #00b048, #059669)' }
                  }>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="card-chip"></div>
                      <div className="card-brand-logo" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                        {paymentMethod.toUpperCase()}
                      </div>
                    </div>
                    <div className="card-number-display">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </div>
                    <div className="card-bottom-row">
                      <div>
                        <div className="card-holder-label">Karta Egasi</div>
                        <div className="card-holder-value">
                          {cardHolder || "KARTA EGASI"}
                        </div>
                      </div>
                      <div>
                        <div className="card-expiry-label">Muddati</div>
                        <div className="card-expiry-value">
                          {cardExpiry || "MM/YY"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fields for Click Wallet (Phone number) */}
                {paymentMethod === 'click' && clickPayType === 'wallet' && (
                  <div className="input-group-new" style={{ marginBottom: '1.25rem' }}>
                    <label>Click Wallet telefon raqamingiz <span>*</span></label>
                    <input 
                      type="tel" 
                      placeholder="+998 90 123 45 67" 
                      value={clickWalletPhone} 
                      onChange={(e) => setClickWalletPhone(formatPhoneUz(e.target.value))} 
                      required 
                      className="input-new"
                    />
                    <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '4px', lineHeight: 1.4 }}>
                      Hamyonga ulangan telefon raqamingiz. Sizga tasdiqlash uchun SMS kod yuboriladi.
                    </div>
                  </div>
                )}

                {/* Fields for Card inputs (For Payme, or Click Card pay type) */}
                {(paymentMethod === 'payme' || (paymentMethod === 'click' && clickPayType === 'card')) && (
                  <>
                    <div className="input-group-new">
                      <label>Karta raqami <span>*</span></label>
                      <input 
                        type="text" 
                        placeholder={paymentMethod === 'payme' ? "8600 0000 0000 0000 (Uzcard/Humo)" : "8600 0000 0000 0000"} 
                        value={cardNumber} 
                        onChange={(e) => handleCardNumberChange(e.target.value)} 
                        required 
                        className="input-new"
                      />
                    </div>

                    <div className="form-grid-2">
                      <div className="input-group-new">
                        <label>Amal qilish muddati <span>*</span></label>
                        <input 
                          type="text" 
                          placeholder="MM/YY" 
                          value={cardExpiry} 
                          onChange={(e) => handleExpiryChange(e.target.value)} 
                          required 
                          className="input-new"
                        />
                      </div>
                      
                      {(cardBrand === 'visa' || cardBrand === 'mastercard') && (
                        <div className="input-group-new">
                          <label>CVV / CVC kodi <span>*</span></label>
                          <input 
                            type="password" 
                            placeholder="123" 
                            value={cardCvv} 
                            onChange={(e) => handleCvvChange(e.target.value)} 
                            required 
                            className="input-new"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}



                <button 
                  type="submit" 
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #ff3366, #ff5c8a)',
                    color: 'white',
                    padding: '0.9rem',
                    border: 'none',
                    borderRadius: '24px',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(255, 51, 102, 0.25)',
                    marginTop: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  To'lash: {formatPrice(getCheckoutTotal())}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                    {paymentMethod === 'click' && clickPayType === 'wallet' ? (
                      <span style={{ padding: '4px 12px', background: '#0072ff', color: 'white', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
                        🔵 CLICK.UZ
                      </span>
                    ) : cardBrand === 'humo' || cardNumber.replace(/\s+/g, '').startsWith('9860') ? (
                      <span style={{ padding: '4px 12px', background: '#00b048', color: 'white', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
                        🟢 HUMO
                      </span>
                    ) : (
                      <span style={{ padding: '4px 12px', background: '#0052d4', color: 'white', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
                        🔵 UZCARD
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '3.2rem', margin: '0.5rem 0' }}>💬</div>
                  <h4 style={{ fontWeight: '750', fontSize: '1.1rem', color: '#1f1f1f', margin: '0 0 0.5rem 0' }}>SMS tasdiqlash kodi yuborildi</h4>
                  <p style={{ fontSize: '0.85rem', color: '#718096', margin: 0, lineHeight: 1.5 }}>
                    {paymentMethod === 'click' && clickPayType === 'wallet' 
                      ? "Click Hamyonga bog'langan telefoningizga tasdiqlash kodi yuborildi."
                      : `${cardBrand === 'humo' || cardNumber.replace(/\s+/g, '').startsWith('9860') ? 'HUMO' : 'UZCARD'} tizimi orqali kartangizga bog'langan telefoningizga tasdiqlash kodi yuborildi.`
                    }
                  </p>
                </div>

                <div className="input-group-new" style={{ alignItems: 'center' }}>
                  <input 
                    type="text" 
                    maxLength={5}
                    placeholder="• • • • •" 
                    value={otpCode} 
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 5))} 
                    required 
                    style={{
                      width: '160px',
                      height: '52px',
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      textAlign: 'center',
                      letterSpacing: '12px',
                      paddingLeft: '12px',
                      border: '2px solid #eef0f2',
                      borderRadius: '12px',
                      outline: 'none',
                      backgroundColor: '#fafbfc',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = '#eef0f2'}
                  />
                </div>

                <div style={{ textAlign: 'center', margin: '1rem 0 1.5rem 0', fontSize: '0.85rem', color: '#718096' }}>
                  {otpTimer > 0 ? (
                    <span>Kodni qayta yuborish: <strong>{otpTimer} soniya</strong></span>
                  ) : (
                    <button 
                      type="button" 
                      onClick={sendVerificationCode} 
                      style={{ background: 'none', border: 'none', color: '#0072ff', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                    >
                      Kodni qayta yuborish
                    </button>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessingPayment} 
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #0072ff, #00c6ff)',
                    color: 'white',
                    padding: '0.9rem',
                    border: 'none',
                    borderRadius: '24px',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    cursor: isProcessingPayment ? 'not-allowed' : 'pointer',
                    opacity: isProcessingPayment ? 0.75 : 1,
                    boxShadow: '0 4px 14px rgba(0, 114, 255, 0.25)',
                    transition: 'all 0.2s'
                  }}
                >
                  {isProcessingPayment ? 'Tasdiqlanmoqda...' : "To'lovni Tasdiqlash"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* ─── Premium Custom Alert Modal in the Center ─── */}
      {customAlert.show && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          animation: 'fadeInModalBackdrop 0.2s ease forwards'
        }} onClick={() => {
          setCustomAlert(prev => ({ ...prev, show: false }));
          if (customAlert.type === 'success') navigate('/profile');
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '2.25rem',
            width: '90%',
            maxWidth: '380px',
            textAlign: 'center',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e6e8eb',
            transform: 'scale(0.96)',
            animation: 'scaleInModal 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: customAlert.type === 'success' ? '#e8f7ed' : '#fff0f3',
              color: customAlert.type === 'success' ? '#00b533' : 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              fontSize: '1.75rem',
              fontWeight: 'bold'
            }}>
              {customAlert.type === 'success' ? '✓' : '!'}
            </div>
            <h4 style={{
              fontSize: '1.15rem',
              fontWeight: '700',
              marginBottom: '0.75rem',
              color: '#1a1a1a',
              textTransform: 'uppercase',
              letterSpacing: '0.03em'
            }}>
              {customAlert.type === 'success' ? 'Muvaffaqiyatli' : 'Diqqat'}
            </h4>
            <p style={{
              fontSize: '0.9rem',
              color: '#757575',
              lineHeight: '1.5',
              marginBottom: '1.75rem',
              whiteSpace: 'pre-line'
            }}>
              {customAlert.message}
            </p>
            <button 
              type="button" 
              onClick={() => {
                setCustomAlert(prev => ({ ...prev, show: false }));
                if (customAlert.type === 'success') navigate('/profile');
              }}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '8px',
                background: customAlert.type === 'success' ? '#00b533' : 'var(--color-primary)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.92rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                boxShadow: customAlert.type === 'success' ? '0 4px 12px rgba(0, 181, 51, 0.2)' : '0 4px 12px rgba(255, 51, 102, 0.25)'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              Tushundim
            </button>
          </div>
        </div>
      )}

      {/* ─── Premium Uzum Market Style Success Order Modal ─── */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          animation: 'fadeInModalBackdrop 0.25s ease forwards'
        }} onClick={() => {
          setShowSuccessModal(false);
          navigate('/');
        }}>
          <div className="success-modal-card" onClick={(e) => e.stopPropagation()}>
            
            {/* Top Right Close Button */}
            <button 
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/');
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#F3F4F6',
                color: '#4b5563',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            >
              ×
            </button>

            {/* Top Green Check Circle */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#00C853',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>
              ✓
            </div>

            {/* Title */}
            <h4 style={{
              fontSize: '1.65rem',
              fontWeight: '700',
              marginBottom: '0.75rem',
              color: '#1a1a1a',
              letterSpacing: '-0.02em'
            }}>
              Buyurtma qabul qilindi
            </h4>

            {/* Description */}
            <p style={{
              fontSize: '0.88rem',
              color: '#4b5563',
              lineHeight: '1.6',
              marginBottom: '1.5rem',
              padding: '0 0.5rem'
            }}>
              Buyurtmangiz muvaffaqiyatli qabul qilindi. Buyurtma raqami: <strong style={{ color: 'var(--color-primary)' }}>#{placedOrderDetails?.orderNumber || placedOrderDetails?._id?.substring(placedOrderDetails?._id?.length - 6).toUpperCase() || ''}</strong>. Operatorlarimiz tez orada siz bilan bog'lanishadi.
            </p>

            {/* Gray Info Card */}
            <div style={{
              backgroundColor: '#F2F4F7',
              borderRadius: '18px',
              padding: '1.25rem 1.5rem',
              textAlign: 'left',
              marginBottom: '1.75rem'
            }}>
              <h5 style={{
                fontSize: '1.15rem',
                fontWeight: '700',
                color: '#1a1a1a',
                margin: '0 0 8px 0'
              }}>
                Lumiere
              </h5>
              
              <div style={{ fontSize: '0.82rem', color: '#718096', marginBottom: '4px' }}>
                Yetkazib berish manzili
              </div>
              
              <div style={{
                fontSize: '0.92rem',
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: '1.25rem'
              }}>
                {placedOrderDetails?.customerDetails?.address || ''}
              </div>

              <h6 style={{
                fontSize: '1.05rem',
                fontWeight: '700',
                color: '#1a1a1a',
                margin: '0 0 10px 0'
              }}>
                Kutilmoqda
              </h6>

              {/* Product thumbnails list */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {placedOrderDetails?.items?.map((item, idx) => (
                  <img 
                    key={idx}
                    src={item.image} 
                    alt={item.name} 
                    style={{
                      width: '56px',
                      height: '56px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1.5px solid #E5E7EB'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="success-modal-buttons">
              <button 
                type="button" 
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/profile');
                }}
                style={{
                  flex: 1,
                  padding: '0.9rem',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  color: '#1a1a1a',
                  border: '1.5px solid #E5E7EB',
                  fontWeight: '600',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                Buyurtmalarim
              </button>
              
              <button 
                type="button" 
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/');
                }}
                style={{
                  flex: 1.25,
                  padding: '0.9rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  boxShadow: '0 4px 14px rgba(255, 51, 102, 0.25)'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                Xaridlarni davom ettirish
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
