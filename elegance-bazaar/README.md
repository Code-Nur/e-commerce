# Elegance Bazaar

**Elegance Bazaar** — bu eng zamonaviy darajadagi e-commerce tizimi bo'lib, o'zining chiroyli dizayni, intuitiv ishlatilish qulayligi hamda mustahkam frontend (React) va BaaS (Firebase) arxitekturasiga egadir.

## 💎 Imkoniyatlari (Features)

- **Elektron Tijorat Do'koni:** Mijozlar mahsulotlarni filtrlashi, batafsil sahifasida o'zlashtirishi va xaridlarini boshqarishi mumkin.
- **Xavfsiz Autentifikatsiya:** Google va Email/Password yordamida tezkor tizimga kirish, ro'yxatdan o'tish jarayonlari (Firebase Auth orqali).
- **Optimallashtirilgan UI:** Shadcn UI va Radix UI hamda Tailwind bilan qurilgan yuqori sifatli animatsion va moslashuvchan (responsive) vizual qism.
- **Tip Xavfsizligi (Type Safe):** Barcha React interfeyslar, holatlar va komponentlar aniq tipe-level (TypeScript) aniqliklari asosida yaratilgan bo'lib har xil run-time xatolarni olishning iloji yo'q. Allaqachon `any` tiplaridan xalos bo'lingan.
- **Fast Refresh (Hot-Reload):** Barcha UI elementlari React Vite ning HMR formatiga to'liq tushadigan va ogohlantirishsiz ishlaydi.

## 🏃 Ishni boshlash (Getting Started)

Loyihangizni sinab ko'rish va tizimga o'zgartirishlar kiritish uchun:

1. **Paketlarni arxivdan chiqarish va tayyorlash:**
   ```bash
   npm install
   ```
2. **Development serverini ishga tushirish:**
   ```bash
   npm run dev
   ```
3. Brauzerda berilgan local oynasi orqali tizimga kiring (Masalan, `http://localhost:5173`).

## 🔧 Loyihaning asosiy texnologiyalari

| Texnologiya | Vazifasi |
| :--- | :--- |
| **Vite** | Tezkor front-end yig'uvchi (bundler) vosita. |
| **React + TS** | Foydalanuvchi interfeysini qurish (Qatiy tiplangan). |
| **TailwindCSS** | Asosiy stillarni yozish imkoniyati. |
| **Firebase** | Backend infratuzilmasi, Data bazasi (Firestore) va Auth tizimi uchun. |
| **Framer Motion**| Sahifa va bloklar almashgandagi chiroyli animatsiyalar uchun. |
| **Zod** | Foydalanuvchi kiritadigan form ma'lumotlarini qat'iy tekshirish uchun. |
| **Lucide React**| Minimalistik, zamonaviy vektor ikonalar. |

## 👨‍💻 Dasturiy Muhit (Scripts)

Loyiha tayyorligini yana bir bor nazorat qilish va xatolarni tuzatish uchun:

- **Lint:** `npm run lint` — ESLint rules va barcha Fast Refresh checklarini kodda amalga oshiradi.
- **Type Check:** `npx tsc --noEmit` — TS compilation orqali tiplar mosligini tahlil qiladi.
- **Tayyorlash:** `npm run build` — Haqiqiy Production muhitiga papkani render qilidi (Builds minified HTML, CSS va JS in `/dist`).

> Loyiha kodlari avtomatik kod-inspektor orqali barcha qattiq TypeScript xatolaridan tozalangan bo'lib, eng barqaror darajaga yetkazilgan.
