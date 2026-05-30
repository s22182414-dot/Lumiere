const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const readline = require("readline");
const fs = require('fs');
const path = require('path');

const apiId = 34880244;
const apiHash = "5e68e4e6a73dca936bfc8fd2ed62e2ca";
const stringSession = new StringSession(""); 

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log("🚀 Telegram Userbot (shaxsiy akkount) faollashtirish jarayoni boshlandi...");
  
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => {
      const num = await askQuestion("\n📞 Telefon raqamingizni kiriting (+998XXXXXXXXX formatida): ");
      return num.trim();
    },
    phoneCode: async () => {
      const code = await askQuestion("\n💬 Telegram ilovangizga (yoki SMS orqali) kelgan 5 xonali kodni kiriting: ");
      return code.trim();
    },
    password: async () => {
      const pass = await askQuestion("\n🔒 Ikki bosqichli xavfsizlik (2FA) parolingiz bo'lsa kiriting (bo'lmasa shunchaki Enter bosing): ");
      return pass.trim();
    },
    onError: (err) => console.log("⚠️ Xatolik yuz berdi:", err.message),
  });

  console.log("\n✅ Shaxsiy Telegram akkountingizga muvaffaqiyatli ulandingiz!");
  const savedSession = client.session.save();
  
  // Save session to .env file
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Append or replace TELEGRAM_SESSION, API_ID, API_HASH
  if (envContent.includes('TELEGRAM_SESSION=')) {
    envContent = envContent.replace(/TELEGRAM_SESSION=.*/, `TELEGRAM_SESSION=${savedSession}`);
  } else {
    envContent += `\nTELEGRAM_SESSION=${savedSession}`;
  }

  if (envContent.includes('TELEGRAM_API_ID=')) {
    envContent = envContent.replace(/TELEGRAM_API_ID=.*/, `TELEGRAM_API_ID=${apiId}`);
  } else {
    envContent += `\nTELEGRAM_API_ID=${apiId}`;
  }

  if (envContent.includes('TELEGRAM_API_HASH=')) {
    envContent = envContent.replace(/TELEGRAM_API_HASH=.*/, `TELEGRAM_API_HASH=${apiHash}`);
  } else {
    envContent += `\nTELEGRAM_API_HASH=${apiHash}`;
  }
  
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log("💾 Sessiya va API kalitlari .env fayliga muvaffaqiyatli yozildi!");
  console.log("\n🎉 Endi bot emas, sizning shaxsiy akkountingiz (@OKteampls) saytdan buyurtma bergan barcha mijozlarga avtomatik yozadi!");
  
  await client.disconnect();
  console.log("🔌 Userbot bog'lanishi xavfsiz tarzda uzildi.");
  rl.close();
  process.exit(0);
}

main().catch(err => {
  console.error("\n❌ Login jarayonida xatolik yuz berdi:", err);
  rl.close();
  process.exit(1);
});
