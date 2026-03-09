import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/data/products";
import Layout from "@/components/Layout";
import { toast } from "sonner";

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ShoppingBag size={36} className="text-muted-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Savatcha bo'sh</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Mahsulotlarni qo'shish uchun do'konga o'ting
          </p>
          <Link
            to="/products"
            className="mt-6 flex h-11 items-center gap-2 rounded-xl bg-primary px-6 font-display text-sm font-bold text-primary-foreground"
          >
            Xarid qilish
          </Link>
        </div>
      </Layout>
    );
  }

  const handleQuantityChange = (productId: string, newQty: number, stock: number) => {
    if (newQty > stock) {
      toast.error(`Omborda faqat ${stock} dona mavjud`);
      return;
    }
    updateQuantity(productId, newQty);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/products" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} />
          Xaridni davom ettirish
        </Link>

        <h1 className="mb-8 font-display text-3xl font-bold text-foreground">Savatcha</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-4">
              {items.map((item, i) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-card"
                >
                  <Link to={`/product/${item.product.id}`}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link to={`/product/${item.product.id}`}>
                        <h3 className="font-display text-sm font-semibold text-foreground hover:text-primary">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground">{item.product.seller}</p>
                      {item.quantity >= item.product.stock && (
                        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-sale">
                          <AlertTriangle size={12} />
                          Maksimal miqdor
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-lg border border-border px-1">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1, item.product.stock)}
                          className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1, item.product.stock)}
                          disabled={item.quantity >= item.product.stock}
                          className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <p className="font-display text-sm font-bold text-foreground">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6 shadow-card">
              <h3 className="mb-4 font-display text-lg font-bold text-foreground">Buyurtma xulosasi</h3>

              <div className="mb-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mahsulotlar</span>
                  <span className="text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Yetkazib berish</span>
                  <span className="font-medium text-fresh">Bepul</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-display font-semibold text-foreground">Jami</span>
                    <span className="font-display text-lg font-bold text-foreground">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              {user ? (
                <Link
                  to="/checkout"
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  Buyurtmani rasmiylashtirish
                </Link>
              ) : (
                <Link
                  to="/login"
                  state={{ from: "/checkout" }}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  Kirish va buyurtma berish
                </Link>
              )}

              <button
                onClick={clearCart}
                className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-destructive"
              >
                Savatchani tozalash
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
