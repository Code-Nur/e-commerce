import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Star, Truck, Shield, Minus, Plus, Check, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Product, formatPrice } from "@/data/products";
import { subscribeProductById, subscribeProducts } from "@/lib/productService";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToCart, getItemQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeProductById(
      id,
      (found) => {
        setProduct(found);
        setError(null);
        setLoading(false);
      },
      () => {
        setError("Mahsulotni yuklab bo'lmadi");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const unsubscribe = subscribeProducts(
      (products) => {
        setAllProducts(products);
      },
      () => {
        setAllProducts([]);
      }
    );

    return () => unsubscribe();
  }, []);

  const related = useMemo(() => {
    if (!product) {
      return [];
    }
    return allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  }, [allProducts, product]);

  useEffect(() => {
    setQuantity(1);
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-xl rounded-xl border border-sale/20 bg-sale/10 p-4 text-center text-sm text-sale">{error}</div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center">
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">Mahsulot topilmadi</h2>
          <Link to="/products" className="mt-4 text-sm font-medium text-primary hover:underline">
            ← Mahsulotlarga qaytish
          </Link>
        </div>
      </Layout>
    );
  }

  const currentInCart = getItemQuantity(product.id);
  const maxCanAdd = product.stock - currentInCart;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("Bu mahsulot hozir sotuvda yo'q");
      return;
    }

    if (!user) {
      toast.error("Buyurtma berish uchun tizimga kiring");
      navigate("/login", { state: { from: `/product/${product.id}` } });
      return;
    }

    if (quantity > maxCanAdd) {
      toast.error(`Omborda faqat ${product.stock} dona mavjud (savatchada: ${currentInCart})`);
      return;
    }

    for (let i = 0; i < quantity; i += 1) {
      addToCart(product);
    }

    setAdded(true);
    toast.success(`"${product.name}" (${quantity} dona) savatchaga qo'shildi`);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/products" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} />
          Mahsulotlarga qaytish
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="overflow-hidden rounded-2xl border border-border">
            <img src={product.image} alt={product.name} className="h-[400px] w-full object-cover lg:h-[500px]" />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            {product.badge && (
              <span
                className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  product.badge === "sale" ? "bg-sale text-primary-foreground" : "bg-fresh text-primary-foreground"
                }`}
              >
                {product.badge === "sale" ? "Chegirma" : "Yangi"}
              </span>
            )}

            <h1 className="mb-2 font-display text-2xl font-bold text-foreground md:text-3xl">{product.name}</h1>
            <p className="mb-2 text-sm text-muted-foreground">Kategoriya: {product.category}</p>
            <p className="mb-4 text-sm text-muted-foreground">Sotuvchi: {product.seller}</p>

            <div className="mb-6 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.floor(product.rating) ? "fill-star text-star" : "text-muted"} />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({product.reviews} sharh)</span>
            </div>

            <div className="mb-6">
              <p className="font-display text-3xl font-extrabold text-foreground">{formatPrice(product.price)}</p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="mt-1 text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
              )}
            </div>

            <p className="mb-6 leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="mb-6 text-sm">
              <span className={isOutOfStock ? "text-sale" : "text-fresh"}>
                {isOutOfStock ? "Sotuvda yo'q" : `Mavjud (${product.stock} dona)`}
              </span>
              {currentInCart > 0 && <span className="ml-3 text-muted-foreground">Savatchada: {currentInCart} dona</span>}
            </div>

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 rounded-xl border border-border px-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-display font-semibold text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(quantity + 1, maxCanAdd > 0 ? maxCanAdd : 1))}
                  disabled={isOutOfStock}
                  className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || (maxCanAdd <= 0 && !!user)}
                className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl font-display text-sm font-bold text-primary-foreground transition-all duration-300 ${
                  isOutOfStock || (maxCanAdd <= 0 && user)
                    ? "cursor-not-allowed bg-muted text-muted-foreground"
                    : added
                    ? "scale-[1.02] bg-fresh"
                    : "bg-primary hover:opacity-90"
                }`}
              >
                {isOutOfStock ? (
                  "Sotuvda yo'q"
                ) : maxCanAdd <= 0 && user ? (
                  "Maksimal miqdorga yetdi"
                ) : added ? (
                  <>
                    <Check size={18} />
                    Qo'shildi
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    {user ? "Savatchaga qo'shish" : "Kirish va buyurtma berish"}
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
              <div className="flex items-center gap-3 text-sm">
                <Truck size={18} className="text-primary" />
                <span className="text-muted-foreground">Bepul yetkazib berish (100,000+ so'm)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield size={18} className="text-primary" />
                <span className="text-muted-foreground">30 kun ichida qaytarish kafolati</span>
              </div>
            </div>
          </motion.div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 font-display text-2xl font-bold text-foreground">O'xshash mahsulotlar</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
