import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User as UserIcon, MapPin, Phone, Save, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile, updateUserProfile, UserProfile } from "@/lib/profileService";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import Layout from "@/components/Layout";

// Vaqtinchalik: Mahsulotlarni yuklash uchun ma'lumotlar
const initialProducts = [
  {
    id: "1",
    name: "Simsiz Bluetooth Quloqchin",
    price: 299000,
    originalPrice: 450000,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    category: "electronics",
    rating: 4.8,
    reviews: 234,
    badge: "sale",
    description: "Yuqori sifatli simsiz quloqchin, shovqinni yo'qotish funksiyasi bilan. 30 soatgacha batareya ishlash vaqti.",
    stock: 45,
    seller: "TechStore UZ",
  },
  {
    id: "2",
    name: "Zamonaviy Smart Soat",
    price: 890000,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    category: "electronics",
    rating: 4.6,
    reviews: 156,
    badge: "new",
    description: "Sport va kundalik hayot uchun ideal smart soat. GPS, yurak urishi monitoringi va 50+ sport rejimi.",
    stock: 23,
    seller: "GadgetWorld",
  },
  {
    id: "3",
    name: "Erkaklar Klassik Ko'ylagi",
    price: 189000,
    originalPrice: 250000,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop",
    category: "clothing",
    rating: 4.5,
    reviews: 89,
    badge: "sale",
    description: "100% paxta, yumshoq va qulay klassik erkaklar ko'ylagi. Barcha mavsumlar uchun mos.",
    stock: 120,
    seller: "FashionHub",
  },
  {
    id: "4",
    name: "Oshxona Robot Blender",
    price: 520000,
    image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&h=400&fit=crop",
    category: "home",
    rating: 4.7,
    reviews: 312,
    description: "Ko'p funksiyali blender — smoothie, sup, va boshqa taomlar tayyorlash uchun ideal.",
    stock: 67,
    seller: "HomeElite",
  },
  {
    id: "5",
    name: "Yoga Matrasi Premium",
    price: 145000,
    image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=400&h=400&fit=crop",
    category: "sports",
    rating: 4.9,
    reviews: 445,
    badge: "new",
    description: "6mm qalinlikdagi premium yoga matrasi. Sirib ketmaydigan yuzasi va qulay tashish sumkasi bilan.",
    stock: 89,
    seller: "SportLife",
  },
  {
    id: "6",
    name: "Ayollar Sumkasi - Charm",
    price: 340000,
    originalPrice: 480000,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
    category: "clothing",
    rating: 4.4,
    reviews: 178,
    badge: "sale",
    description: "Yuqori sifatli sun'iy teri sumka. Keng ichki bo'lma va elegant dizayn.",
    stock: 34,
    seller: "FashionHub",
  },
  {
    id: "7",
    name: "Dasturlash Asoslari Kitobi",
    price: 85000,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop",
    category: "books",
    rating: 4.8,
    reviews: 523,
    description: "Boshlang'ichlar uchun dasturlash asoslari. Python, JavaScript va boshqa tillar haqida.",
    stock: 200,
    seller: "BookWorld",
  },
  {
    id: "8",
    name: "Yuz parvarishi to'plami",
    price: 275000,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
    category: "beauty",
    rating: 4.6,
    reviews: 267,
    badge: "new",
    description: "Tabiiy ingredientlardan tayyorlangan yuz parvarishi to'plami. Krem, tonik va serum.",
    stock: 56,
    seller: "BeautyPro",
  },
];

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [form, setForm] = useState<UserProfile>({
    fullName: "",
    phone: "",
    region: "",
    address: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/profile" }, replace: true });
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setForm(profile);
      } else {
        setForm((prev) => ({ ...prev, fullName: user.displayName || "" }));
      }
      setLoading(false);
    };

    loadProfile();
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await updateUserProfile(user, form);
      toast.success("Profil ma'lumotlari saqlandi");
    } catch (error) {
      toast.error("Ma'lumotlarni saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  // Vaqtinchalik: Bazaga mahsulotlarni yuklash funksiyasi
  const handleSeedProducts = async () => {
    if (!confirm("Barcha boshlang'ich mahsulotlar Firestore ga yuklanadi. Davom etamizmi?")) return;
    
    setSeeding(true);
    try {
      const loadingToast = toast.loading("Mahsulotlar yuklanmoqda...");
      for (const product of initialProducts) {
        const docRef = doc(db, "products", product.id);
        await setDoc(docRef, product);
      }
      toast.success("Barcha mahsulotlar muvaffaqiyatli yuklandi!", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Mahsulotlarni yuklashda xatolik yuz berdi");
    } finally {
      setSeeding(false);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} />
          Bosh sahifa
        </Link>

        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center gap-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="h-16 w-16 rounded-full border-2 border-primary/20" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {(user.displayName || user.email || "U")[0].toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Profil</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-6 shadow-card sm:p-8"
          >
            <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-200">
              <p className="font-medium mb-1">Eslatma</p>
              Ushbu ma'lumotlar buyurtma berish (checkout) vaqtida avtomatik tarzda to'ldiriladi.
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <UserIcon size={16} className="text-muted-foreground" />
                      To'liq ism
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Ism Familiya"
                      className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Phone size={16} className="text-muted-foreground" />
                      Telefon raqam *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+998 90 123 45 67"
                      required
                      className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <MapPin size={16} className="text-muted-foreground" />
                      Viloyat / Shahar *
                    </label>
                    <select
                      name="region"
                      value={form.region}
                      onChange={handleChange}
                      required
                      className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Tanlang</option>
                      <option value="toshkent">Toshkent shahri</option>
                      <option value="toshkent_v">Toshkent viloyati</option>
                      <option value="samarqand">Samarqand</option>
                      <option value="buxoro">Buxoro</option>
                      <option value="fargona">Farg'ona</option>
                      <option value="andijon">Andijon</option>
                      <option value="namangan">Namangan</option>
                      <option value="xorazm">Xorazm</option>
                      <option value="navoiy">Navoiy</option>
                      <option value="qashqadaryo">Qashqadaryo</option>
                      <option value="surxondaryo">Surxondaryo</option>
                      <option value="jizzax">Jizzax</option>
                      <option value="sirdaryo">Sirdaryo</option>
                      <option value="qoraqalpogiston">Qoraqalpog'iston</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <MapPin size={16} className="text-muted-foreground" />
                      Manzil *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Ko'cha, uy raqami"
                      required
                      className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-8 font-display text-sm font-bold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-70"
                  >
                    {saving ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    Saqlash
                  </button>
                </div>
              </form>
            )}
          </motion.div>

          {/* Admin Tools - Buni keyinchalik Admin panelga ko'chirish kerak */}
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6 dark:bg-red-950/20 dark:border-red-900/50">
            <h3 className="mb-2 font-display text-lg font-bold text-red-800 dark:text-red-400">Admin Tools (Vaqtinchalik)</h3>
            <p className="mb-4 text-sm text-red-700 dark:text-red-300">
              Ushbu tugma faqat dastlabki sozlashlar uchun mo'ljallangan va mahsulotlarni bazaga yuklaydi.
            </p>
            <button
              onClick={handleSeedProducts}
              disabled={seeding}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {seeding ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Yuklanmoqda...
                </>
              ) : (
                "Mahsulotlarni bazaga yuklash"
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
