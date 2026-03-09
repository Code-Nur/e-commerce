import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Check, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Product, formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const currentQty = getItemQuantity(product.id);
  const isOutOfStock = product.stock <= 0;
  const isMaxStock = currentQty >= product.stock;

  const handleAdd = () => {
    if (isOutOfStock) {
      toast.error("Bu mahsulot hozir sotuvda yo'q");
      return;
    }

    if (!user) {
      toast.error("Buyurtma berish uchun tizimga kiring");
      navigate("/login", { state: { from: `/product/${product.id}` } });
      return;
    }

    if (isMaxStock) {
      toast.error(`Omborda faqat ${product.stock} dona mavjud`);
      return;
    }

    addToCart(product);
    setAdded(true);
    toast.success(`"${product.name}" savatchaga qo'shildi`);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow duration-300 hover:shadow-card-hover"
    >
      {product.badge && (
        <span
          className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-xs font-semibold ${
            product.badge === "sale" ? "bg-sale text-primary-foreground" : "bg-fresh text-primary-foreground"
          }`}
        >
          {product.badge === "sale" ? "Chegirma" : "Yangi"}
        </span>
      )}

      <Link to={`/product/${product.id}`} className="block overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      <div className="p-4">
        <p className="mb-1 text-xs font-medium text-muted-foreground">{product.category}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="mb-2 line-clamp-2 font-display text-sm font-semibold text-card-foreground transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="mb-3 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            <Star size={14} className="fill-star text-star" />
            <span className="text-xs font-medium text-foreground">{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>

        {isOutOfStock ? (
          <p className="mb-2 text-xs font-medium text-sale">Sotuvda yo'q</p>
        ) : product.stock <= 5 ? (
          <p className="mb-2 text-xs font-medium text-sale">Faqat {product.stock} dona qoldi</p>
        ) : (
          <p className="mb-2 text-xs font-medium text-fresh">Omborda mavjud: {product.stock}</p>
        )}

        <div className="flex items-end justify-between">
          <div>
            <p className="font-display text-lg font-bold text-foreground">{formatPrice(product.price)}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
            )}
          </div>

          {currentQty > 0 && !isOutOfStock ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="h-9 items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 p-1"
            >
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateQuantity(product.id, currentQty - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                >
                  <Minus size={14} />
                </button>
                <span className="w-5 text-center text-sm font-display font-semibold text-foreground">{currentQty}</span>
                <button
                  onClick={() => updateQuantity(product.id, currentQty + 1)}
                  disabled={isMaxStock}
                  className={`flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm transition-opacity ${
                    isMaxStock ? "cursor-not-allowed opacity-50" : "hover:opacity-90"
                  }`}
                >
                  <Plus size={14} />
                </button>
              </div>
            </motion.div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={isOutOfStock || isMaxStock}
              className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 transition-all duration-300 ${
                isOutOfStock || isMaxStock
                  ? "cursor-not-allowed bg-muted text-muted-foreground"
                  : added
                  ? "scale-110 bg-fresh text-primary-foreground"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
              title={isOutOfStock ? "Sotuvda yo'q" : "Savatchaga qo'shish"}
            >
              {isOutOfStock ? (
                <span className="text-[10px] font-semibold">Yo'q</span>
              ) : (
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check size={16} />
                    </motion.span>
                  ) : (
                    <motion.span key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <ShoppingCart size={16} />
                    </motion.span>
                  )}
                </AnimatePresence>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
