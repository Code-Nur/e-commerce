import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Clock, Truck, CheckCircle2, XCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { Order, OrderStatus } from "@/lib/orderService";
import { formatPrice } from "@/data/products";
import Layout from "@/components/Layout";

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  pending: {
    label: "Kutilmoqda",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: <Clock size={14} />,
  },
  confirmed: {
    label: "Tasdiqlandi",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: <CheckCircle2 size={14} />,
  },
  shipping: {
    label: "Yetkazilmoqda",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: <Truck size={14} />,
  },
  delivered: {
    label: "Yetkazildi",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: <CheckCircle2 size={14} />,
  },
  cancelled: {
    label: "Bekor qilindi",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: <XCircle size={14} />,
  },
};

const formatDate = (timestamp: Timestamp | null): string => {
  if (!timestamp) return "-";
  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp.toDate());
};

const OrderCard = ({ order, index }: { order: Order; index: number }) => {
  const status = statusConfig[order.status] || statusConfig.pending;
  const hasAdminResponse = order.adminResponse.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-lg"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Package size={18} className="text-primary" />
          <span className="font-display text-sm font-bold text-foreground">#{order.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.bgColor} ${status.color}`}>
          {status.icon}
          {status.label}
        </div>
      </div>

      <div className="mb-4 space-y-2">
        {order.items.slice(0, 3).map((item) => (
          <div key={`${order.id}-${item.productId}`} className="flex items-center gap-3">
            <img src={item.image} alt={item.productName} className="h-10 w-10 flex-shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{item.productName}</p>
              <p className="text-xs text-muted-foreground">
                {item.quantity} × {formatPrice(item.unitPrice)}
              </p>
            </div>
          </div>
        ))}
        {order.items.length > 3 && <p className="pl-13 text-xs text-muted-foreground">+{order.items.length - 3} ta mahsulot</p>}
      </div>

      <div className="mb-4 rounded-lg border border-border/70 bg-muted/30 p-3">
        <p className="text-xs font-semibold text-foreground">Admin javobi</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {hasAdminResponse
            ? order.adminResponse
            : order.status === "pending"
            ? "Buyurtma ko'rib chiqilmoqda. Tez orada admin javobi chiqadi."
            : "Ushbu status uchun qo'shimcha izoh qoldirilmagan."}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div className="text-xs text-muted-foreground">
          <p>Yaratilgan: {formatDate(order.createdAt)}</p>
          <p>Status yangilangan: {formatDate(order.statusUpdatedAt)}</p>
        </div>
        <span className="font-display text-sm font-bold text-foreground">{formatPrice(order.totalAmount)}</span>
      </div>
    </motion.div>
  );
};

const OrdersPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading, error } = useOrders();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { state: { from: "/orders" }, replace: true });
    }
  }, [authLoading, user, navigate]);

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Hisob tekshirilmoqda...</p>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} />
          Bosh sahifa
        </Link>

        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-foreground">Buyurtmalarim</h1>
          {orders.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {orders.length} ta buyurtma
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">Buyurtmalar yuklanmoqda...</p>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-xl rounded-xl border border-sale/20 bg-sale/10 p-5 text-center">
            <p className="text-sm text-sale">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              Qayta urinish
            </button>
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag size={36} className="text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">Hali buyurtma yo'q</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Siz hali buyurtma bermadingiz. Mahsulotlarni ko'rib chiqing va birinchi buyurtmangizni bering.
            </p>
            <Link
              to="/products"
              className="mt-6 flex h-11 items-center gap-2 rounded-xl bg-primary px-6 font-display text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Mahsulotlarni ko'rish
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order, index) => (
              <OrderCard key={order.id} order={order} index={index} />
            ))}
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Real-vaqtda yangilanmoqda
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;
