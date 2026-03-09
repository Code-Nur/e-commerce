import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import {
  Order,
  OrderItem,
  CreateOrderData,
  createOrder,
  subscribeToUserOrders,
  StockError,
} from "@/lib/orderService";
import { getProductById } from "@/lib/productService";
import { toast } from "sonner";

interface CheckoutFormData {
  fullName: string;
  phone: string;
  region: string;
  address: string;
  comment: string;
  paymentMethod: string;
}

interface CartProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

interface CartLine {
  product: CartProduct;
  quantity: number;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  placing: boolean;
  placeOrder: (formData: CheckoutFormData, cartItems: CartLine[], totalPrice: number) => Promise<string | null>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    const unsubscribe = subscribeToUserOrders(
      user.uid,
      (updatedOrders) => {
        setOrders(updatedOrders);
        setLoading(false);
        setError(null);
      },
      () => {
        setLoading(false);
        setError("Buyurtmalarni yuklashda xatolik yuz berdi");
      }
    );

    return () => unsubscribe();
  }, [user]);

  const placeOrder = useCallback(
    async (formData: CheckoutFormData, cartItems: CartLine[], totalPrice: number): Promise<string | null> => {
      if (!user) {
        toast.error("Buyurtma berish uchun tizimga kiring");
        return null;
      }

      if (cartItems.length === 0) {
        toast.error("Savatcha bo'sh");
        return null;
      }

      setPlacing(true);
      try {
        for (const line of cartItems) {
          const latestProduct = await getProductById(line.product.id);
          if (!latestProduct) {
            toast.error(`"${line.product.name}" mahsuloti topilmadi`);
            return null;
          }
          if (line.quantity > latestProduct.stock) {
            toast.error(`"${line.product.name}" uchun ombordagi son: ${latestProduct.stock}`);
            return null;
          }
        }

        const orderItems: OrderItem[] = cartItems.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          unitPrice: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        }));

        const orderData: CreateOrderData = {
          customerId: user.uid,
          paymentMethod: formData.paymentMethod,
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.phone,
            region: formData.region,
            address: formData.address,
            comment: formData.comment,
          },
          items: orderItems,
          totalAmount: totalPrice,
        };

        const orderId = await createOrder(orderData);
        toast.success("Buyurtmangiz muvaffaqiyatli qabul qilindi");
        return orderId;
      } catch (error) {
        if (error instanceof StockError) {
          toast.error(`Mahsulot yetarli emas: ${error.available} dona`);
          return null;
        }

        console.error("Buyurtma yaratishda xatolik:", error);
        toast.error("Buyurtma yaratishda xatolik yuz berdi. Qaytadan urinib ko'ring");
        return null;
      } finally {
        setPlacing(false);
      }
    },
    [user]
  );

  return <OrderContext.Provider value={{ orders, loading, error, placing, placeOrder }}>{children}</OrderContext.Provider>;
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within OrderProvider");
  }
  return context;
};
