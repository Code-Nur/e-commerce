import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { Category } from "@/data/products";
import { subscribeCategories } from "@/lib/categoryService";
import LucideIconByName from "@/components/LucideIconByName";
import Layout from "@/components/Layout";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeCategories(
      (data) => {
        setCategories(data);
        setLoading(false);
        setError(null);
      },
      () => {
        setError("Kategoriyalarni yuklab bo'lmadi");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Kategoriyalar</h1>
        <p className="mb-8 text-sm text-muted-foreground">Barcha bo'limlarni ko'ring</p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-9 w-9 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-sale/20 bg-sale/10 p-4 text-sm text-sale">{error}</div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Kategoriyalar mavjud emas
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={`/products?category=${cat.name}`}
                  className="flex items-center gap-5 rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <LucideIconByName name={cat.icon} size={28} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">{cat.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoriesPage;
