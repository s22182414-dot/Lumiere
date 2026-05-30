// Telegram Userbot Session Generator
// Run: node generate-session.cjs
// Bu skript sizning Telegram akkountingiz uchun yangi sessiya yaratadi

const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const readline = require('readline');

const apiId = 34880244;
const apiHash = '5e68e4e6a73dca936bfc8fd2ed62e2ca';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  console.log('\n🔑 Telegram Sessiya Generatori');
  console.log('================================\n');
  
  const stringSession = new StringSession('');
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await ask('📱 Telegram telefon raqamingiz (+998...): '),
    password: async () => await ask('🔒 2FA parolingiz (agar bo\'lsa): '),
    phoneCode: async () => await ask('📨 Telegramga kelgan tasdiqlash kodi: '),
    onError: (err) => console.log('❌ Xato:', err.message),
  });

  const session = client.session.save();
  console.log('\n✅ Sessiya muvaffaqiyatli yaratildi!\n');
  console.log('📋 Sessiya stringi (bu qatorni .env fayliga TELEGRAM_SESSION= sifatida qo\'ying):\n');
  console.log(session);
  console.log('\n');
  
  rl.close();
  await client.disconnect();
  process.exit(0);
}

main();
