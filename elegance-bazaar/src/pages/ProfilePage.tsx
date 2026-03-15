import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User as UserIcon, MapPin, Phone, Save, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile, updateUserProfile, UserProfile } from "@/lib/profileService";
import { toast } from "sonner";
import Layout from "@/components/Layout";

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
