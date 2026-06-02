// Lumiere Telegram Auth Bot — v3
// Run: node bot.cjs
// Flow: user clicks "Login with Telegram" on website → opens t.me/bot?start=TOKEN → bot saves session → website auto-detects

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const https = require('https');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');

// ─── MongoDB Connection ────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lumiere';
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('🔌 MongoDB ga muvaffaqiyatli ulandi!');
    seedCredentials();
  })
  .catch(err => {
    console.error('❌ MongoDB ulanish xatosi:', err.message);
    console.log('⚠️ Iltimos, MongoDB lokal ravishda ishlayotganligini yoki MONGO_URI to\'g\'ri sozlanganligini tekshiring.');
  });

// ─── Mongoose Models ──────────────────────────────────────────────────────────
const OrderSchema = new mongoose.Schema({
  telegramId: { type: String, required: true },
  orderNumber: { type: String, unique: true },
  items: [{
    id: Number,
    name: String,
    image: String,
    price: Number,
    quantity: Number
  }],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'Kutilmoqda' },
  customerDetails: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    phone: { type: String, default: '' },
    city: { type: String, default: '' },
    address: { type: String, default: '' },
    paymentMethod: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now }
});

const ReviewSchema = new mongoose.Schema({
  telegramId: { type: String, required: true },
  userName: { type: String, default: 'Foydalanuvchi' },
  userPhoto: { type: String, default: '' },
  productId: { type: Number, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);
const Review = mongoose.model('Review', ReviewSchema);

const CredentialSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const Credential = mongoose.model('Credential', CredentialSchema);

const BannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  image: { type: String, default: '' },
  bg: { type: String, default: 'linear-gradient(135deg, #FF3366, #FF8DA1)' },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  linkedProductIds: { type: [mongoose.Schema.Types.Mixed], default: [] },
  createdAt: { type: Date, default: Date.now }
});
const Banner = mongoose.model('Banner', BannerSchema);

// Seed credentials
async function seedCredentials() {
  try {
    const adminExists = await Credential.findOne({ role: 'admin' });
    if (!adminExists) {
      await new Credential({
        role: 'admin',
        password: process.env.VITE_ADMIN_PASSWORD || 'admin'
      }).save();
      console.log('🌱 Admin paroli MongoDB da yaratildi.');
    }
    const sellerExists = await Credential.findOne({ role: 'seller' });
    if (!sellerExists) {
      await new Credential({
        role: 'seller',
        password: process.env.VITE_SELLER_PASSWORD || 'seller'
      }).save();
      console.log('🌱 Seller paroli MongoDB da yaratildi.');
    }
    // Seed default banners
    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      await Banner.insertMany([
        { title: "Go'zallik bayrami", desc: "Yuqori sifatli va eksklyuziv kosmetika to'plamlari", image: '/beauty_banner_one.png', bg: 'linear-gradient(135deg, #FF3366, #FF8DA1)', order: 0 },
        { title: 'Koreya kosmetikasi', desc: "Yangi brendlar va eksklyuziv mahsulotlar keldi", image: '/korean_beauty_two.png', bg: 'linear-gradient(135deg, #00B533, #66E088)', order: 1 },
        { title: 'Kuzgi parvarish', desc: "Teringiz uchun eng yaxshi namlantiruvchi vositalar", image: '/autumn_care_three.png', bg: 'linear-gradient(135deg, #7000FF, #B366FF)', order: 2 }
      ]);
      console.log('🌱 3 ta default banner MongoDB da yaratildi.');
    }
  } catch (err) {
    console.error('❌ Credentials seeding error:', err.message);
  }
}

// ─── Config ───────────────────────────────────────────────────────────────────
const BOT_TOKEN    = '8999837328:AAHkB-Myx9bjZMpORnXVbrDzcQiS9J-ucgQ';
const FIREBASE_KEY = 'AIzaSyAACRi9UwWLY3ywH-t9RMvtTzV5nGKjL34';
const PROJECT_ID   = 'lumiere-fd65f';
// ──────────────────────────────────────────────────────────────────────────────

// HTTPS PATCH helper
function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({}); } });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// Save auth session to Firestore: auth_sessions/{token}
async function saveAuthSession(token, user, photoUrl = '') {
  const body = JSON.stringify({
    fields: {
      telegramId: { stringValue: user.id.toString() },
      firstName:  { stringValue: user.first_name || '' },
      lastName:   { stringValue: user.last_name  || '' },
      username:   { stringValue: user.username   || '' },
      chatId:     { stringValue: user.id.toString() },
      photoUrl:   { stringValue: photoUrl },
      createdAt:  { integerValue: Date.now().toString() }
    }
  });
  return httpsRequest({
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/auth_sessions/${token}?key=${FIREBASE_KEY}`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  }, body);
}

// ─── Bot ──────────────────────────────────────────────────────────────────────
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
console.log('🤖 Lumiere Bot v3 ishga tushdi! @lumiereparfumeshop_bot\n');

// /start TOKEN  — website login flow
bot.onText(/\/start (.+)/, async (msg, match) => {
  const token  = match[1].trim();
  const user   = msg.from;
  const chatId = msg.chat.id;
  const name   = user.first_name || 'Foydalanuvchi';

  console.log(`🔑 Login so'rovi: token=${token}, user=${name} (${user.id})`);

  let photoUrl = '';
  try {
    const photos = await bot.getUserProfilePhotos(user.id, { limit: 1 });
    if (photos && photos.total_count > 0 && photos.photos[0] && photos.photos[0][0]) {
      const fileId = photos.photos[0][0].file_id; // Smallest size is ideal for avatar
      const file = await bot.getFile(fileId);
      photoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;
      console.log(`📸 Telegram avatar topildi: ${photoUrl}`);
    }
  } catch (photoErr) {
    console.error('⚠️ Telegram avatar olishda xato:', photoErr.message);
  }

  try {
    await saveAuthSession(token, user, photoUrl);
    console.log(`✅ Sessiya saqlandi: ${token} → ${user.id} (photoUrl: ${photoUrl ? 'Bor' : 'Yo\'q'})`);

    bot.sendMessage(chatId,
      `✅ *${name}, muvaffaqiyatli kirdingiz!*\n\n` +
      `🛍 Lumiere Cosmetics saytiga qaytib xarid qilishingiz mumkin.\n\n` +
      `Yana savol bo'lsa /start yuboring.`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    console.error('❌ Sessiya saqlash xatosi:', err.message);
    bot.sendMessage(chatId, '⚠️ Tizimda xato yuz berdi. Saytda qaytadan urinib ko\'ring.');
  }
});

// /start (without token) — welcome
bot.onText(/^\/start$/, (msg) => {
  const name = msg.from.first_name || 'Siz';
  bot.sendMessage(msg.chat.id,
    `👋 Salom, *${name}*!\n\n` +
    `Bu *Lumiere Cosmetics* rasmiy kirish boti.\n\n` +
    `Saytga kirish uchun saytdagi *"Telegram orqali kirish"* tugmasini bosing.`,
    { parse_mode: 'Markdown' }
  );
});

// Listen for user sending photo/screenshot (payment receipt check)
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from.first_name || 'Foydalanuvchi';
  console.log(`📸 To'lov cheki yuborildi! user_id=${chatId}`);

  bot.sendMessage(chatId,
    `✅ *Rahmat, ${name}! To'lov chekingiz (screenshot) qabul qilindi.*\n\n` +
    `⏳ Operatorlarimiz tez orada to'lovni tekshirib, buyurtmangizni tasdiqlashadi. Tasdiqlanganligi haqida sizga xabar yuboriladi!`,
    { parse_mode: 'Markdown' }
  );
});

bot.on('polling_error', (err) => console.error('Polling xato:', err.code));

// ─── Telegram Userbot (Shaxsiy Akkount) Integration ───────────────────────────
let userbotClient = null;

async function startUserbot() {
  const session = process.env.TELEGRAM_SESSION;
  const apiId = process.env.TELEGRAM_API_ID ? Number(process.env.TELEGRAM_API_ID) : null;
  const apiHash = process.env.TELEGRAM_API_HASH;

  if (session && apiId && apiHash) {
    console.log("🚀 Telegram Userbot sessiyasi topildi. Ulanish boshlanmoqda...");
    try {
      const stringSession = new StringSession(session);
      userbotClient = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
      });
      await userbotClient.connect();
      
      // Verify authorization
      const authorized = await userbotClient.isUserAuthorized();
      if (!authorized) {
        throw new Error("Sessiya faol emas, yaroqsiz yoki Telegram tomonidan o'chirilgan.");
      }
      
      console.log("✅ Telegram Userbot (shaxsiy akkount) muvaffaqiyatli bog'landi!");

      // Listen for incoming photos on shaxsiy account to auto-reply to payment receipts
      userbotClient.addEventHandler(async (event) => {
        const message = event.message;
        if (message.photo && !message.out) {
          try {
            const sender = await message.getSender();
            const senderName = sender.firstName || 'Mijoz';
            await userbotClient.sendMessage(message.chatId, {
              message: `✅ Rahmat, ${senderName}! To'lov chekingiz (screenshot) qabul qilindi.\n\n` +
                       `⏳ Yaqin orada to'lovni tekshirib, buyurtmangizni tasdiqlayman!`
            });
            console.log(`📸 Userbot to'lov chekini shaxsiy chatda oldi va javob berdi!`);
          } catch (handlerErr) {
            console.error("Userbot event handler error:", handlerErr.message);
          }
        }
      }, new NewMessage({}));

    } catch (err) {
      console.error("❌ Telegram Userbot ulanish xatosi:", err.message);
      userbotClient = null;
    }
  } else {
    console.log("ℹ️ Telegram Userbot (shaxsiy akkount) sozlangan emas. Xabarlar faqat bot orqali jo'natiladi.");
  }
}

// Start userbot initialization
startUserbot();

// ─── Express API Server ───────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// API Endpoints:

// 1. GET /api/orders/:telegramId - Fetch orders for a user
app.get('/api/orders/:telegramId', async (req, res) => {
  try {
    const orders = await Order.find({ telegramId: req.params.telegramId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('❌ Orders fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. POST /api/orders - Create a new order (Checkout)
app.post('/api/orders', async (req, res) => {
  try {
    const { telegramId, items, totalPrice, customerDetails, status } = req.body;
    if (!telegramId || !items || !totalPrice) {
      return res.status(400).json({ error: "Missing required fields (telegramId, items, totalPrice)" });
    }

    // Generate unique 6-digit orderNumber
    let orderNumber = '';
    let isUnique = false;
    while (!isUnique) {
      orderNumber = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await Order.findOne({ orderNumber });
      if (!existing) {
        isUnique = true;
      }
    }

    const newOrder = new Order({ 
      telegramId, 
      items, 
      totalPrice, 
      customerDetails, 
      status: status || 'Kutilmoqda',
      orderNumber 
    });
    await newOrder.save();
    console.log(`🛒 Yangi buyurtma saqlandi! user=${telegramId}, raqam=${orderNumber}, summa=${totalPrice} so'm`);

    // Dynamic Telegram notification
    if (telegramId && telegramId !== 'offline') {
      try {
        let itemsText = items.map(item => `• *${item.name}* (${item.quantity} ta)`).join('\n');
        
        let paymentStatusText = '';
        if (customerDetails.paymentMethod.toLowerCase().includes('telegram')) {
          paymentStatusText = 
            `💬 *To'lov usuli: Telegram orqali to'lash*\n\n` +
            `⚠️ *TO'LOV QILISH UCHUN YO'RIQNOMA:*\n` +
            `Iltimos, buyurtma uchun to'lovni quyidagi plastik kartaga o'tkazing:\n` +
            `💳 *Karta raqam:* \`8600 4929 1122 3344\`\n` +
            `👤 *Karta egasi:* Sunnatillo B.\n` +
            `💰 *Jami summa:* ${totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm\n\n` +
            `📸 *To'lovdan so'ng, to'lov cheki (screenshot)ni menga (shaxsiy chatga) yuboring!*`;
        } else if (customerDetails.paymentMethod.toLowerCase().includes('online')) {
          paymentStatusText = `💳 *Karta orqali onlayn to'landi (Uzcard/Humo/Visa)*`;
        } else {
          paymentStatusText = `💵 *Mahsulotni olganda to'lash (Naqd pul)*`;
        }

        const messageBody = 
          `🎉 *Buyurtmangiz qabul qilindi!*\n` +
          `📌 *Buyurtma raqami:* #${orderNumber}\n\n` +
          `🛍 *Xaridlar tarkibi:*\n${itemsText}\n\n` +
          `💰 *Jami summa:* ${totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm\n` +
          `💳 *To'lov holati:* ${status === "To'langan" ? "✅ To'langan" : "⏳ Kutilmoqda"}\n\n` +
          `${paymentStatusText}\n\n` +
          `Rahmat! Buyurtmangiz tez orada yetkazib beriladi.`;

        let sentViaUserbot = false;
        if (userbotClient) {
          try {
            let peer = null;
            
            // 1. Try finding via telegramId (convert string to BigInt for GramJS)
            if (telegramId && !isNaN(telegramId)) {
              try {
                peer = await userbotClient.getEntity(BigInt(telegramId));
                console.log(`🔍 Userbot telegramId orqali entity topdi: ${telegramId}`);
              } catch (idErr) {
                console.log(`⚠️ Userbot telegramId bo'yicha entity topa olmadi: ${idErr.message}`);
              }
            }
            
            // 2. Try finding via phone number if telegramId search failed
            if (!peer && customerDetails && customerDetails.phone) {
              let cleanPhone = customerDetails.phone.trim();
              if (!cleanPhone.startsWith('+')) {
                cleanPhone = '+' + cleanPhone;
              }
              try {
                console.log(`🔍 Userbot telefon raqami orqali qidirmoqda: ${cleanPhone}`);
                peer = await userbotClient.getEntity(cleanPhone);
                console.log(`✅ Userbot telefon raqami orqali entity topdi!`);
              } catch (phoneErr) {
                console.log(`⚠️ Userbot telefon raqami bo'yicha ham topa olmadi: ${phoneErr.message}`);
              }
            }

            // 3. Send message if peer is found
            if (peer) {
              const mijozIsmi = `${customerDetails.firstName || ''} ${customerDetails.lastName || ''}`.trim() || 'Mijoz';
              const formattedPrice = totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
              
              await userbotClient.sendMessage(peer, { message: `Assalomu alaykum, ${mijozIsmi}` });
              await userbotClient.sendMessage(peer, { message: `Siz #${orderNumber} ni buyurtirgan ekansiz.` });
              await userbotClient.sendMessage(peer, { message: `Iltimos, buyurtmangiz uchun ${formattedPrice}ni quyidagi kartaga o'tkazing:\n\n💳 Karta: 8600 4929 1122 3344\n👤 Karta egasi: Sunnatillo B.\n\nTo'lovdan so'ng, iltimos, chekni ham tashlab yuboring.` });
              
              console.log(`✉️ Userbot orqali muvaffaqiyatli yuborildi! user=${telegramId}`);
              sentViaUserbot = true;
            } else {
              console.log(`⚠️ Userbot peer topa olmadi (telegramId: ${telegramId}, phone: ${customerDetails ? customerDetails.phone : 'yo\'q'}). Bot orqali yuboriladi.`);
            }
          } catch (ubErr) {
            console.error('⚠️ Userbot xabar yuborishda xato:', ubErr.message);
          }
        }

        if (!sentViaUserbot) {
          const mijozIsmi = `${customerDetails.firstName || ''} ${customerDetails.lastName || ''}`.trim() || 'Mijoz';
          const mahsulotlar = items.map(item => item.name).join(', ');
          const formattedPrice = totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
          
          await bot.sendMessage(telegramId, `Assalomu alaykum, ${mijozIsmi}`);
          await bot.sendMessage(telegramId, `Siz #${orderNumber} ni buyurtirgan ekansiz.`);
          await bot.sendMessage(telegramId, `Iltimos, buyurtmangiz uchun ${formattedPrice}ni quyidagi kartaga o'tkazing:\n\n💳 Karta: 8600 4929 1122 3344\n👤 Karta egasi: Sunnatillo B.\n\nTo'lovdan so'ng, iltimos, chekni ham tashlab yuboring.`);
          
          console.log(`✉️ Bot orqali yuborildi! user=${telegramId}`);
        }
      } catch (tgErr) {
        console.error('⚠️ Telegram bildirishnomasi yuborishda xato:', tgErr.message);
      }
    }

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('❌ Order save error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. GET /api/reviews - Fetch reviews (all, or filtered)
app.get('/api/reviews', async (req, res) => {
  try {
    const { telegramId, productId } = req.query;
    let query = {};
    if (telegramId) query.telegramId = telegramId;
    if (productId) query.productId = productId;

    const reviews = await Review.find(query).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('❌ Reviews fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 4. POST /api/reviews - Save a new review
app.post('/api/reviews', async (req, res) => {
  try {
    const { telegramId, userName, userPhoto, productId, productName, productImage, rating, comment } = req.body;
    if (!telegramId || !productId || !rating || !comment) {
      return res.status(400).json({ error: "Missing required fields (telegramId, productId, rating, comment)" });
    }

    // Check if user has already left a review for this product
    const existingReview = await Review.findOne({ telegramId, productId: Number(productId) });
    if (existingReview) {
      return res.status(400).json({ error: "Siz ushbu mahsulotga allaqachon sharh yozgansiz!" });
    }

    const newReview = new Review({
      telegramId, userName, userPhoto, productId: Number(productId), productName, productImage, rating, comment
    });
    await newReview.save();
    console.log(`💬 Yangi sharh saqlandi! user=${telegramId}, product=${productName}, baho=${rating}`);
    res.status(201).json(newReview);
  } catch (err) {
    console.error('❌ Review save error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE /api/reviews/:id - Delete a review
app.delete('/api/reviews/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    console.log(`🗑 Sharh o'chirildi! ID: ${req.params.id}`);
    res.json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    console.error('❌ Review delete error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 6. GET /api/orders/count - Get dynamic total orders count for a product
app.get('/api/orders/count', async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({ error: "Missing productId query parameter" });
    }
    
    // Find all orders containing this product ID in their items array
    const orders = await Order.find({ "items.id": Number(productId) });
    
    // Sum the quantity of this product across all those orders
    let totalCount = 0;
    orders.forEach(order => {
      order.items.forEach(item => {
        if (Number(item.id) === Number(productId)) {
          totalCount += item.quantity || 1;
        }
      });
    });
    
    res.json({ productId: Number(productId), count: totalCount });
  } catch (err) {
    console.error('❌ Orders count error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 7. GET /api/seller/orders - Fetch all orders for seller dashboard
app.get('/api/seller/orders', async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('❌ Seller orders fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 8. PATCH /api/orders/:id/status - Update order status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Missing status field" });
    }
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    console.log(`📦 Buyurtma holati yangilandi! ID: ${req.params.id}, Holat: ${status}`);
    res.json(updatedOrder);
  } catch (err) {
    console.error('❌ Order status update error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 9. POST /api/auth/verify - Verify credentials in MongoDB
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { role, password } = req.body;
    if (!role || !password) {
      return res.status(400).json({ success: false, error: "Role va parol maydonlari to'ldirilishi shart!" });
    }

    let cred = await Credential.findOne({ role });
    if (!cred) {
      const defaultPw = role === 'admin' 
        ? (process.env.VITE_ADMIN_PASSWORD || 'admin') 
        : (process.env.VITE_SELLER_PASSWORD || 'seller');
      cred = new Credential({ role, password: defaultPw });
      await cred.save();
    }

    if (cred.password === password) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Kiritilgan parol noto'g'ri!" });
    }
  } catch (err) {
    console.error('❌ Auth verification error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. POST /api/auth/change-password - Change credentials in MongoDB
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { role, currentPassword, newPassword } = req.body;
    if (!role || !currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Barcha maydonlar to'ldirilishi shart!" });
    }

    let cred = await Credential.findOne({ role });
    if (!cred) {
      const defaultPw = role === 'admin' 
        ? (process.env.VITE_ADMIN_PASSWORD || 'admin') 
        : (process.env.VITE_SELLER_PASSWORD || 'seller');
      cred = new Credential({ role, password: defaultPw });
      await cred.save();
    }

    if (cred.password !== currentPassword) {
      return res.status(401).json({ success: false, error: "Joriy parol noto'g'ri!" });
    }

    cred.password = newPassword;
    await cred.save();
    console.log(`🔑 ${role.toUpperCase()} paroli muvaffaqiyatli o'zgartirildi!`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Auth change password error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Banner API Endpoints ─────────────────────────────────────────────────────

// GET /api/banners - Fetch all banners sorted by order
app.get('/api/banners', async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ order: 1 });
    res.json(banners);
  } catch (err) {
    console.error('❌ Banners fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/banners - Create a new banner
app.post('/api/banners', async (req, res) => {
  try {
    const { title, desc, image, bg, linkedProductIds } = req.body;
    if (!title) return res.status(400).json({ error: "Title majburiy!" });
    const count = await Banner.countDocuments();
    const newBanner = new Banner({ 
      title, 
      desc: desc || '', 
      image: image || '', 
      bg: bg || 'linear-gradient(135deg, #FF3366, #FF8DA1)', 
      order: count,
      linkedProductIds: linkedProductIds || []
    });
    await newBanner.save();
    console.log(`🖼 Yangi banner qo'shildi: ${title}`);
    res.status(201).json(newBanner);
  } catch (err) {
    console.error('❌ Banner create error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/banners/:id - Update a banner
app.put('/api/banners/:id', async (req, res) => {
  try {
    const { title, desc, image, bg, order, active, linkedProductIds } = req.body;
    const updated = await Banner.findByIdAndUpdate(
      req.params.id,
      { 
        ...(title !== undefined && { title }), 
        ...(desc !== undefined && { desc }), 
        ...(image !== undefined && { image }), 
        ...(bg !== undefined && { bg }), 
        ...(order !== undefined && { order }), 
        ...(active !== undefined && { active }),
        ...(linkedProductIds !== undefined && { linkedProductIds })
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Banner topilmadi!' });
    console.log(`✏️ Banner yangilandi: ${updated.title}`);
    res.json(updated);
  } catch (err) {
    console.error('❌ Banner update error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/banners/reorder - Bulk reorder banners
app.put('/api/banners/reorder/bulk', async (req, res) => {
  try {
    const { orders } = req.body; // [{ id, order }, ...]
    if (!orders || !Array.isArray(orders)) return res.status(400).json({ error: 'orders array kerak!' });
    await Promise.all(orders.map(({ id, order }) => Banner.findByIdAndUpdate(id, { order })));
    const banners = await Banner.find({}).sort({ order: 1 });
    res.json(banners);
  } catch (err) {
    console.error('❌ Banner reorder error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/banners/:id - Delete a banner
app.delete('/api/banners/:id', async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    console.log(`🗑 Banner o'chirildi! ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Banner delete error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Click & Payme Payment Gateway Sandbox Webhooks ───────────────────────────

// 1. Click Billing Webhook Callback (POST /api/payment/click)
// Emulates Click's 2-stage (Prepare & Complete) billing protocol.
app.post('/api/payment/click', async (req, res) => {
  try {
    const {
      click_trans_id,
      service_id,
      click_paydoc_id,
      merchant_trans_id, // This is our MongoDB Order ID
      amount,
      action, // 0 = Prepare, 1 = Complete
      error,
      error_note,
      sign_time,
      sign_string
    } = req.body;

    console.log(`🔵 [CLICK CALLBACK] action=${action}, order_id=${merchant_trans_id}, trans_id=${click_trans_id}, sum=${amount}`);

    // Verify order in MongoDB
    if (!merchant_trans_id || !mongoose.Types.ObjectId.isValid(merchant_trans_id)) {
      return res.json({ error: -5, error_note: "Order ID is invalid" });
    }

    const order = await Order.findById(merchant_trans_id);
    if (!order) {
      return res.json({ error: -9, error_note: "Transaction/Order not found" });
    }

    // Check amount matches total price
    if (Number(amount) !== order.totalPrice) {
      return res.json({ error: -2, error_note: "Incorrect parameter amount" });
    }

    // Action 0: Prepare
    if (Number(action) === 0) {
      console.log(`🔵 [CLICK Prepare] Order ${merchant_trans_id} is verified and ready for payment.`);
      return res.json({
        click_trans_id,
        merchant_trans_id,
        merchant_prepare_id: merchant_trans_id,
        error: 0,
        error_note: "Success"
      });
    }

    // Action 1: Complete
    if (Number(action) === 1) {
      order.status = "To'langan";
      order.customerDetails.paymentMethod = "online (CLICK)";
      await order.save();

      console.log(`✅ [CLICK Complete] Payment successful! Order ${merchant_trans_id} is marked as PAID.`);

      // Send custom Telegram notification to buyer
      if (order.telegramId && order.telegramId !== 'offline') {
        try {
          const itemsText = order.items.map(item => `• *${item.name}* (${item.quantity} ta)`).join('\n');
          await bot.sendMessage(order.telegramId, 
            `🎉 *Click orqali to'lovingiz muvaffaqiyatli qabul qilindi!*\n\n` +
            `🛍 *Xaridlar tarkibi:*\n${itemsText}\n\n` +
            `💰 *Jami summa:* ${order.totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm\n` +
            `💳 *To'lov holati:* ✅ To'langan (Click Sandbox)\n\n` +
            `Rahmat! Buyurtmangiz yaqin orada yetkazib beriladi.`,
            { parse_mode: 'Markdown' }
          );
        } catch (tgErr) {
          console.error("Telegram billing notification failed:", tgErr.message);
        }
      }

      return res.json({
        click_trans_id,
        merchant_trans_id,
        merchant_confirm_id: merchant_trans_id,
        error: 0,
        error_note: "Success"
      });
    }

    return res.json({ error: -3, error_note: "Action not supported" });
  } catch (err) {
    console.error('❌ Click Callback error:', err.message);
    res.json({ error: -1, error_note: err.message });
  }
});

// 2. Payme JSON-RPC 2.0 Webhook Callback (POST /api/payment/payme)
// Emulates Paycom's merchant processing methods.
app.post('/api/payment/payme', async (req, res) => {
  try {
    const { method, params, id } = req.body;
    console.log(`🟢 [PAYME JSON-RPC] method=${method}, id=${id}`);

    if (method === 'CheckPerformTransaction') {
      const orderId = params.account?.order_id;
      if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
        return res.json({ id, error: { code: -31050, message: "Order ID invalid" } });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.json({ id, error: { code: -31050, message: "Order not found" } });
      }

      if (Number(params.amount) !== order.totalPrice * 100) { // Payme uses tiyins (1/100 of sum)
        return res.json({ id, error: { code: -31001, message: "Incorrect amount" } });
      }

      return res.json({
        id,
        result: { allow: true }
      });
    }

    if (method === 'CreateTransaction') {
      const orderId = params.account?.order_id;
      if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
        return res.json({ id, error: { code: -31050, message: "Order ID invalid" } });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.json({ id, error: { code: -31050, message: "Order not found" } });
      }

      return res.json({
        id,
        result: {
          create_time: Date.now(),
          transaction: params.id,
          state: 1
        }
      });
    }

    if (method === 'PerformTransaction') {
      const transId = params.id;
      // We will look up by order_id or transaction parameters.
      // For sandbox simplicity, we can fetch orderId from context/req params or direct params.
      // Let's retrieve order from DB and mark as paid.
      const orderId = req.headers['order-id'] || params.order_id; 
      
      let order = null;
      if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
        order = await Order.findById(orderId);
      }

      if (!order) {
        // Fallback: search for last pending order
        order = await Order.findOne({ status: 'Kutilmoqda' }).sort({ createdAt: -1 });
      }

      if (order) {
        order.status = "To'langan";
        order.customerDetails.paymentMethod = "online (PAYME)";
        await order.save();

        console.log(`✅ [PAYME Perform] Payment successful! Order ${order._id} is marked as PAID.`);

        // Send custom Telegram notification to buyer
        if (order.telegramId && order.telegramId !== 'offline') {
          try {
            const itemsText = order.items.map(item => `• *${item.name}* (${item.quantity} ta)`).join('\n');
            await bot.sendMessage(order.telegramId, 
              `🎉 *Payme orqali to'lovingiz muvaffaqiyatli qabul qilindi!*\n\n` +
              `🛍 *Xaridlar tarkibi:*\n${itemsText}\n\n` +
              `💰 *Jami summa:* ${order.totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm\n` +
              `💳 *To'lov holati:* ✅ To'langan (Payme Sandbox)\n\n` +
              `Rahmat! Buyurtmangiz yaqin orada yetkazib beriladi.`,
              { parse_mode: 'Markdown' }
            );
          } catch (tgErr) {
            console.error("Telegram billing notification failed:", tgErr.message);
          }
        }
      }

      return res.json({
        id,
        result: {
          perform_time: Date.now(),
          transaction: transId,
          state: 2
        }
      });
    }

    if (method === 'CheckTransaction') {
      return res.json({
        id,
        result: {
          create_time: Date.now() - 60000,
          perform_time: Date.now(),
          cancel_time: 0,
          transaction: params.id,
          state: 2,
          reason: null
        }
      });
    }

    return res.json({ id, error: { code: -32601, message: "Method not found" } });
  } catch (err) {
    console.error('❌ Payme Callback error:', err.message);
    res.status(500).json({ id, error: { code: -32400, message: err.message } });
  }
});

// OTP SMS via Userbot (shaxsiy akkount) - Eskiz o'rniga
app.post('/api/send-otp', async (req, res) => {
  try {
    const { telegramId, message } = req.body;
    if (!telegramId || !message) {
      return res.status(400).json({ error: 'telegramId va message talab qilinadi' });
    }

    let sentViaUserbot = false;
    if (userbotClient) {
      try {
        await userbotClient.sendMessage(telegramId, { message });
        console.log(`✉️ OTP Userbot orqali yuborildi! user=${telegramId}`);
        sentViaUserbot = true;
      } catch (ubErr) {
        console.error('⚠️ Userbot OTP xato, botga o\'tilmoqda:', ubErr.message);
      }
    }

    if (!sentViaUserbot) {
      await bot.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
      console.log(`✉️ OTP Bot orqali yuborildi! user=${telegramId}`);
    }

    res.json({ success: true, via: sentViaUserbot ? 'userbot' : 'bot' });
  } catch (err) {
    console.error('❌ OTP yuborish xatosi:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start listening on Port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Express API server ishga tushdi! Port: ${PORT}`);
});
