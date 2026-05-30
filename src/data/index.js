export const COURSES = [
  {
    id: 1, title: "To'liq Web Development Bootcamp", category: "programming",
    instructor: "Javlon Mirzayev", rating: 4.9, reviews: 2840,
    students: 12500, duration: "52 soat", lessons: 124, level: "Boshlang'ich",
    price: 299000, emoji: "💻",
    color: "#f3f0ff",
    progress: 72,
    enrolled: true,
    tags: ["HTML", "CSS", "JavaScript", "React"],
    description: "Noldan boshlab professional web developer bo'ling. HTML, CSS, JavaScript, React va Node.js o'rganing."
  },
  {
    id: 2, title: "UI/UX Dizayn Masterclass — Figma", category: "design",
    instructor: "Nilufar Karimova", rating: 4.8, reviews: 1920,
    students: 8300, duration: "38 soat", lessons: 89, level: "O'rta",
    price: 249000, emoji: "🎨",
    color: "#fff7ed",
    progress: 34,
    enrolled: true,
    tags: ["Figma", "UI", "UX", "Prototyping"],
    description: "Zamonaviy UI/UX dizayn tamoyillari va Figma bilan professional interfeys yarating."
  },
  {
    id: 3, title: "Python bilan Ma'lumotlar Fani", category: "data",
    instructor: "Bobur Yusupov", rating: 4.9, reviews: 3100,
    students: 15600, duration: "65 soat", lessons: 156, level: "O'rta",
    price: 349000, emoji: "🤖",
    color: "#f0fdf4",
    progress: 0,
    enrolled: false,
    tags: ["Python", "Pandas", "ML", "NumPy"],
    description: "Python yordamida ma'lumotlarni tahlil qiling va Machine Learning modellarini yarating."
  },
  {
    id: 4, title: "Digital Marketing va SMM", category: "marketing",
    instructor: "Zilola Hasanova", rating: 4.7, reviews: 1450,
    students: 6200, duration: "28 soat", lessons: 67, level: "Boshlang'ich",
    price: 199000, emoji: "📣",
    color: "#fef9c3",
    progress: 0,
    enrolled: false,
    tags: ["SMM", "SEO", "Analytics", "Ads"],
    description: "Ijtimoiy tarmoqlarda brend yarating va raqamli marketing strategiyalarini o'rganing."
  },
  {
    id: 5, title: "React.js & Next.js Zamonaviy Frontend", category: "programming",
    instructor: "Jasur Nazarov", rating: 4.8, reviews: 2200,
    students: 9800, duration: "44 soat", lessons: 102, level: "Yuqori",
    price: 279000, emoji: "⚛️",
    color: "#eff6ff",
    progress: 0,
    enrolled: false,
    tags: ["React", "Next.js", "TypeScript", "Tailwind"],
    description: "React va Next.js bilan zamonaviy, tezkor va SEO-optimallashtirilgan veb-ilovalar yarating."
  },
  {
    id: 6, title: "Ingliz Tili — Noldan C1 gacha", category: "language",
    instructor: "Malika Tosheva", rating: 4.9, reviews: 4100,
    students: 22000, duration: "80 soat", lessons: 200, level: "Boshlang'ich",
    price: 179000, emoji: "🌍",
    color: "#fdf2f8",
    progress: 0,
    enrolled: false,
    tags: ["Grammar", "Speaking", "IELTS", "Vocabulary"],
    description: "Ingliz tilini noldan C1 darajasigacha o'rganing. IELTS va TOEFL imtihonlariga tayyorlaning."
  },
  {
    id: 7, title: "Biznes va Startap Yaratish", category: "business",
    instructor: "Sherzod Alimov", rating: 4.6, reviews: 980,
    students: 4500, duration: "32 soat", lessons: 78, level: "Boshlang'ich",
    price: 229000, emoji: "🚀",
    color: "#f0fdf4",
    progress: 0,
    enrolled: false,
    tags: ["Business", "Startup", "Finance", "Strategy"],
    description: "O'z biznesingizni boshlang va startap yarating. Biznes-reja, moliyalashtirish va marketing."
  },
  {
    id: 8, title: "Professional Fotografiya Kursi", category: "photo",
    instructor: "Kamola Ergasheva", rating: 4.7, reviews: 760,
    students: 3100, duration: "24 soat", lessons: 58, level: "O'rta",
    price: 189000, emoji: "📸",
    color: "#f8fafc",
    progress: 0,
    enrolled: false,
    tags: ["Photography", "Lightroom", "Composition", "Portrait"],
    description: "Professional fotografiya asoslarini o'rganing va o'z uslubingizni toping."
  },
  {
    id: 9, title: "Flutter bilan Mobil Dasturlash", category: "programming",
    instructor: "Otabek Xasanov", rating: 4.8, reviews: 1340,
    students: 5400, duration: "48 soat", lessons: 115, level: "O'rta",
    price: 319000, emoji: "📱",
    color: "#f0f9ff",
    progress: 0,
    enrolled: false,
    tags: ["Flutter", "Dart", "iOS", "Android"],
    description: "Flutter va Dart yordamida iOS va Android uchun zamonaviy mobil ilovalar yarating."
  },
];

export const CATEGORIES = [
  { id: 'all', label: 'Barchasi', emoji: '📚' },
  { id: 'programming', label: 'Dasturlash', emoji: '💻' },
  { id: 'design', label: 'Dizayn', emoji: '🎨' },
  { id: 'business', label: 'Biznes', emoji: '📊' },
  { id: 'marketing', label: 'Marketing', emoji: '📣' },
  { id: 'language', label: 'Til', emoji: '🌍' },
  { id: 'data', label: 'AI & Data', emoji: '🤖' },
  { id: 'photo', label: 'Foto', emoji: '📸' },
];

export const USER = {
  name: "Sardor Toshmatov",
  email: "sardor@email.com",
  avatar: "S",
  level: "Pro",
  streak: 12,
  totalHours: 48,
  certificates: 2,
  points: 3240,
};

export const ACTIVITY = [
  { day: "Du", minutes: 45 },
  { day: "Se", minutes: 90 },
  { day: "Ch", minutes: 30 },
  { day: "Pa", minutes: 120 },
  { day: "Ju", minutes: 60 },
  { day: "Sh", minutes: 75 },
  { day: "Ya", minutes: 0 },
];

export const getCatName = (cat) => {
  const map = {
    programming: 'Dasturlash', design: 'Dizayn', data: 'AI & Data',
    marketing: 'Marketing', language: 'Til', business: 'Biznes', photo: 'Foto'
  };
  return map[cat] || cat;
};

export const formatNum = (n) => n >= 1000 ? (n / 1000).toFixed(0) + 'K' : String(n);
export const formatPrice = (n) => n.toLocaleString() + " so'm";
