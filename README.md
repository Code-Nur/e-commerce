# E-Commerce Projects Workspace

Ushbu repozitoriy o'z ichiga ikkita zamonaviy e-commerce (elektron tijorat) loyihalarini oladi:

1. **[Elegance Bazaar](./elegance-bazaar/)** - Chiroyli dizayn va ajoyib user-experience'ga ega bo'lgan onlayn do'kon.
2. **[Market Wave X](./market-wave-x/)** - Yana bir tezkor, xavfsiz va samarali elektron tijorat ilovasi.

## 🌐 Jonli Namunalar (Live Demos)
- **User Panel (Elegance Bazaar):** [elegance-bazar.vercel.app](https://elegance-bazar.vercel.app/)
- **Admin Panel:** [e-commerce-bazar-admin.vercel.app](https://e-commerce-bazar-admin.vercel.app/)

## 🚀 Texnologiyalar

Ikkala loyiha ham quyidagi zamonaviy texnologiyalar yordamida qurilgan:
- **React.js** (Vite orqali)
- **TypeScript** - xatoliklarni oldini olish va tip xavfsizligi
- **Tailwind CSS** - zamonaviy stilizatsiya
- **Shadcn UI** & **Radix UI** - yuqori sifatli va qulay UI komponentlar
- **Firebase** - ma'lumotlar bazasi (Firestore) va Autentifikatsiya uchun
- **Lucide React** - chiroyli ikonalar
- **React Router v6** - sahifalararo navigatsiya
- **React Hook Form** & **Zod** - formalar bilan xavfsiz ishlash va validatsiya
- **Zustand / Context API** - global state boshqaruvi

## 📂 Loyihalar tuzilmasi

```
e-commerce/
├── elegance-bazaar/       # 1-Loyiha papkasi
│   ├── src/               # Asosiy kodlar
│   ├── package.json       # Loyihaga tegishli kutubxonalar
│   └── README.md          # Elegance Bazaar uchun hujjat
├── market-wave-x/         # 2-Loyiha papkasi
│   ├── src/               # Asosiy kodlar
│   ├── package.json       # Loyihaga tegishli kutubxonalar
│   └── README.md          # Market Wave X uchun hujjat
└── README.md              # Umumiy hujjat (ushbu fayl)
```

## 🛠️ Loyihalarni ishga tushirish (Local Development)

Qaysi loyihani ishga tushirmoqchi bo'lsangiz, avval terminal orqali o'sha papkaga kiring:

```bash
# Elegance Bazaar'ni ishga tushirish uchun:
cd elegance-bazaar
npm install
npm run dev

# Yoki Market Wave X'ni ishga tushirish uchun:
cd market-wave-x
npm install
npm run dev
```

Shundan so'ng terminalda ko'rsatilgan manzilga kirib loyihani brauzerda ko'rishingiz mumkin (Odatda `http://localhost:5173`).

## 👨‍💻 Kod sifati va Tahlil (Linting & Build)

Loyihalar to'liq analiz qilingan va barcha xatoliklardan tozalangan. Tahlilni ishga tushirish uchun loyiha papkalarida quyidagi komandalarni bajarishingiz mumkin:

- Sintaksis tekshiruv (ESLint): `npm run lint`
- TypeScript tiplarni tekshirish: `npx tsc --noEmit`
- Production uchun tayyorlash: `npm run build`

## 🤝 Hissa qo'shish (Contributing)
Loyiha faqat xususiy maqsadlar uchun qurilgan. Kodni ochib aslo o'zgartirmang kodlar 24/7 nazoratim ostida, muammo istamasangiz kodga umuman tegmang! Agar o'zgartirish kiritmoqchi bo'lsangiz @CodeNur ga aloqaga chiqing.
