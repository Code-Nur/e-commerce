import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, User, CreditCard, CheckCircle2, Loader2, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { getUserProfile, updateUserProfile } from "@/lib/profileService";
import { formatPrice } from "@/data/products";
import Layout from "@/components/Layout";
import { toast } from "sonner";

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { placeOrder, placing } = useOrders();
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" }, replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate, orderPlaced]);

  const [form, setForm] = useState({
    fullName: user?.displayName || "",
    phone: "",
    region: "",
    address: "",
    paymentMethod: "cash",
    comment: "",
  });

  // Profil ma'lumotlarini yuklash (Auto-fill)
  useEffect(() => {
    if (!user) return;
    
    const loadProfile = async () => {
      setProfileLoading(true);
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setForm(prev => ({
          ...prev,
          fullName: profile.fullName || prev.fullName,
          phone: profile.phone || "",
          region: profile.region || "",
          address: profile.address || "",
        }));
      }
      setProfileLoading(false);
    };

    loadProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.region || !form.address) {
      toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring");
      return;
    }
    if (!user) return;

    const invalidLine = items.find((line) => line.quantity > line.product.stock || line.product.stock <= 0);
    if (invalidLine) {
      toast.error(`"${invalidLine.product.name}" uchun stock yetarli emas`);
      return;
    }

    // Profilni fon rejimida yangilab qo'yish (foydalanuvchi keyingi safar ham shu ma'lumotlardan foydalanishi uchun)
    try {
      await updateUserProfile(user, {
        fullName: form.fullName,
        phone: form.phone,
        region: form.region,
        address: form.address,
      });
    } catch (e) {
      console.error("Profilni yangilashda xatolik:", e);
    }

    const newOrderId = await placeOrder(form, items, totalPrice);
    if (newOrderId) {
      setOrderId(newOrderId);
      setOrderPlaced(true);
      clearCart();
    }
  };

  if (!user) return null;

  if (orderPlaced) {
    return (
      <Layout>
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-fresh/20"
          >
            <CheckCircle2 size={48} className="text-fresh" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-2xl font-bold text-foreground"
          >
            Buyurtmangiz qabul qilindi!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 max-w-md text-sm text-muted-foreground"
          >
            Tez orada operatorimiz siz bilan bog'lanadi. Buyurtma raqami: <strong className="text-foreground">#{orderId?.slice(0, 8).toUpperCase()}</strong>
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-1 text-xs text-muted-foreground"
          >
            Status: <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">Kutilmoqda</span>
          </motion.p>
          <div className="mt-8 flex gap-3">
            <Link
              to="/orders"
              className="flex h-11 items-center gap-2 rounded-xl border border-primary px-6 font-display text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
            >
              Buyurtmalarim
            </Link>
            <Link
              to="/"
              className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 font-display text-sm font-bold text-primary-foreground"
            >
              Bosh sahifaga qaytish
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/cart" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} />
          Savatchaga qaytish
        </Link>

        <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Buyurtmani rasmiylashtirish</h1>

        {profileLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                
                <div className="rounded-xl bg-blue-50 p-4 border border-blue-100 flex gap-3 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-200">
                  <Info className="shrink-0" size={20} />
                  <p className="text-sm">
                    Bu yerdagi ma'lumotlar profilingizdan avtomatik olindi. Agar ularni o'zgartirsangiz, profilingizdagi ma'lumotlar ham yangilanadi.
                  </p>
                </div>

                {/* Personal Info */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-foreground">
                    <User size={20} className="text-primary" />
                    Shaxsiy ma'lumotlar
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">To'liq ism *</label>
                      <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Ism Familiya"
                        className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Telefon raqam *</label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+998 90 123 45 67"
                        className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>
                </div>

                {/* Delivery */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-foreground">
                    <MapPin size={20} className="text-primary" />
                    Yetkazib berish manzili
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Viloyat / Shahar *</label>
                      <select name="region" value={form.region} onChange={handleChange}
                        className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
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
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">Manzil *</label>
                      <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Ko'cha, uy raqami"
                        className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Izoh (ixtiyoriy)</label>
                    <textarea name="comment" value={form.comment} onChange={handleChange} rows={3} placeholder="Qo'shimcha izoh..."
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                  </div>
                </div>

                {/* Payment */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                  <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-foreground">
                    <CreditCard size={20} className="text-primary" />
                    To'lov usuli
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { value: "cash", label: "Naqd pul", icon: "💵" },
                      { value: "card", label: "Plastik karta", icon: "💳" },
                      { value: "transfer", label: "Pul o'tkazma", icon: "🏦" },
                    ].map((method) => (
                      <label key={method.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                          form.paymentMethod === method.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                        }`}>
                        <input type="radio" name="paymentMethod" value={method.value} checked={form.paymentMethod === method.value} onChange={handleChange} className="sr-only" />
                        <span className="text-2xl">{method.icon}</span>
                        <span className="text-sm font-medium text-foreground">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-card">
                  <h3 className="mb-4 font-display text-lg font-bold text-foreground">Buyurtma tafsilotlari</h3>
                  <div className="mb-4 max-h-60 space-y-3 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3">
                        <img src={item.product.image} alt={item.product.name} className="h-12 w-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity} × {formatPrice(item.product.price)}</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 border-t border-border pt-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mahsulotlar</span>
                      <span className="text-foreground">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yetkazib berish</span>
                      <span className="font-medium text-fresh">Bepul</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2">
                      <span className="font-display font-semibold text-foreground">Jami</span>
                      <span className="font-display text-lg font-bold text-foreground">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                  <button type="submit" disabled={placing}
                    className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed">
                    {placing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Yuborilmoqda...
                      </>
                    ) : (
                      "Buyurtma berish"
                    )}
                  </button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">Buyurtma tugmasi bosilgandan so'ng operator siz bilan bog'lanadi</p>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default CheckoutPage;
