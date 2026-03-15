import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Grid3X3, List, Loader2, Search } from "lucide-react";
import { Category, Product } from "@/data/products";
import { subscribeProducts } from "@/lib/productService";
import { subscribeCategories } from "@/lib/categoryService";
import ProductCard from "@/components/ProductCard";
import LucideIconByName from "@/components/LucideIconByName";
import Layout from "@/components/Layout";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "rating-desc" | "newest">("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [queryText, setQueryText] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingProducts(true);
    const unsubscribe = subscribeProducts(
      (data) => {
        setProducts(data);
        setLoadingProducts(false);
        setProductsError(null);
      },
      () => {
        setProductsError("Mahsulotlarni yuklab bo'lmadi");
        setLoadingProducts(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setLoadingCategories(true);
    const unsubscribe = subscribeCategories(
      (data) => {
        setCategories(data);
        setLoadingCategories(false);
        setCategoriesError(null);
      },
      () => {
        setCategoriesError("Kategoriyalarni yuklab bo'lmadi");
        setLoadingCategories(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    const needle = queryText.trim().toLowerCase();

    let result = [...products];
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (needle) {
      result = result.filter((p) => {
        const haystack = `${p.name} ${p.description}`.toLowerCase();
        return haystack.includes(needle);
      });
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }
    if (sortBy === "rating-desc") {
      result.sort((a, b) => b.rating - a.rating);
    }
    if (sortBy === "newest") {
      result.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }

    return result;
  }, [products, activeCategory, queryText, sortBy]);

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat === "all") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    setSearchParams(params);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Mahsulotlar</h1>
          {!loadingProducts && <p className="mt-1 text-sm text-muted-foreground">{filtered.length} ta mahsulot topildi</p>}
        </div>

        <div className="mb-4 rounded-xl border border-border bg-card p-3 shadow-card">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Mahsulot nomi yoki tavsif bo'yicha qidirish"
              className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory("all")}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Barchasi
            </button>

            {!loadingCategories &&
              categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.name)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                    activeCategory === cat.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <LucideIconByName name={cat.icon} size={14} />
                  <span>{cat.name}</span>
                </button>
              ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <SlidersHorizontal size={14} className="text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-transparent text-xs text-foreground outline-none"
              >
                <option value="newest">Yangi qo'shilgan</option>
                <option value="price-asc">Narx: arzon → qimmat</option>
                <option value="price-desc">Narx: qimmat → arzon</option>
                <option value="rating-desc">Reyting yuqori</option>
                <option value="default">Standart</option>
              </select>
            </div>
            <div className="hidden gap-1 sm:flex">
              <button
                onClick={() => setView("grid")}
                className={`rounded-lg p-2 ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`rounded-lg p-2 ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {(productsError || categoriesError) && (
          <div className="mb-6 rounded-xl border border-sale/20 bg-sale/10 p-4 text-sm text-sale">
            {productsError || categoriesError}
          </div>
        )}

        {loadingProducts ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Mahsulotlar yuklanmoqda...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "flex flex-col gap-4"
            }
          >
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <p className="mt-4 font-display text-lg font-semibold text-foreground">Mahsulot topilmadi</p>
            <p className="mt-1 text-sm text-muted-foreground">Filter yoki qidiruv so'rovini o'zgartiring</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductsPage;
