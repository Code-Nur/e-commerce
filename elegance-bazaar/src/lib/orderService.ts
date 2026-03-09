import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
  QuerySnapshot,
  DocumentData,
  where,
} from "firebase/firestore";
import { z } from "zod";
import { db } from "./firebase";

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  image: string;
}

export type OrderStatus = "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  region: string;
  address: string;
  comment: string;
}

export interface Order {
  id: string;
  customerId: string;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  totalPrice: number;
  createdAt: Timestamp | null;
  statusUpdatedAt: Timestamp | null;
  adminResponse: string;
}

export interface CreateOrderData {
  customerId: string;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  totalAmount: number;
}

const ORDERS_COLLECTION = "orders";
const ORDER_ITEMS_COLLECTION = "order_items";
const PRODUCTS_COLLECTION = "products";

const timestampSchema = z.union([z.instanceof(Timestamp), z.null()]);

const orderItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  image: z.string().min(1),
});

const legacyOrderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  image: z.string().min(1),
});

const shippingAddressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  region: z.string().min(1),
  address: z.string().min(1),
  comment: z.string().default(""),
});

const orderDocSchema = z.object({
  customer_id: z.string().min(1),
  payment_method: z.string().min(1),
  shipping_address: shippingAddressSchema,
  status: z.enum(["pending", "confirmed", "shipping", "delivered", "cancelled"]),
  items: z.array(orderItemSchema).default([]),
  total_amount: z.number().nonnegative(),
  created_at: timestampSchema.default(null),
  status_updated_at: timestampSchema.default(null),
  admin_response: z.string().optional().default(""),
  admin_note: z.string().optional().default(""),
});

const legacyOrderDocSchema = z.object({
  userId: z.string().min(1),
  paymentMethod: z.string().min(1),
  fullName: z.string().min(1),
  phone: z.string().min(1),
  region: z.string().min(1),
  address: z.string().min(1),
  comment: z.string().default(""),
  status: z.enum(["pending", "confirmed", "shipping", "delivered", "cancelled"]),
  items: z.array(legacyOrderItemSchema).default([]),
  totalPrice: z.number().nonnegative(),
  createdAt: timestampSchema.default(null),
  updatedAt: timestampSchema.optional().default(null),
  adminResponse: z.string().optional().default(""),
  adminNote: z.string().optional().default(""),
});

export class StockError extends Error {
  readonly productId: string;
  readonly available: number;

  constructor(message: string, productId: string, available: number) {
    super(message);
    this.name = "StockError";
    this.productId = productId;
    this.available = available;
  }
}

export const createOrder = async (orderData: CreateOrderData): Promise<string> => {
  const orderRef = doc(collection(db, ORDERS_COLLECTION));

  await runTransaction(db, async (transaction) => {
    const stockSnapshot = new Map<string, { productRef: ReturnType<typeof doc>; currentStock: number }>();

    for (const item of orderData.items) {
      const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      const productSnapshot = await transaction.get(productRef);

      if (!productSnapshot.exists()) {
        throw new StockError(`${item.productName} topilmadi`, item.productId, 0);
      }

      const currentStockRaw = productSnapshot.data().stock;
      const currentStock = typeof currentStockRaw === "number" ? currentStockRaw : Number(currentStockRaw ?? 0);

      if (!Number.isFinite(currentStock) || currentStock < item.quantity) {
        throw new StockError(
          `${item.productName} omborda yetarli emas`,
          item.productId,
          Number.isFinite(currentStock) ? currentStock : 0
        );
      }
      stockSnapshot.set(item.productId, { productRef, currentStock });
    }

    for (const item of orderData.items) {
      const snapshot = stockSnapshot.get(item.productId);
      if (!snapshot) {
        throw new StockError(`${item.productName} omborda tekshirib bo'lmadi`, item.productId, 0);
      }

      transaction.update(snapshot.productRef, { stock: snapshot.currentStock - item.quantity });

      const orderItemRef = doc(collection(db, ORDER_ITEMS_COLLECTION));
      transaction.set(orderItemRef, {
        order_id: orderRef.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        product_name: item.productName,
        created_at: serverTimestamp(),
      });
    }

    transaction.set(orderRef, {
      customer_id: orderData.customerId,
      total_amount: orderData.totalAmount,
      status: "pending" as OrderStatus,
      shipping_address: orderData.shippingAddress,
      payment_method: orderData.paymentMethod,
      items: orderData.items,
      created_at: serverTimestamp(),
      status_updated_at: serverTimestamp(),
      admin_response: "",
    });
  });

  return orderRef.id;
};

const parseOrder = (id: string, raw: unknown): Order | null => {
  const parsed = orderDocSchema.safeParse(raw);
  if (parsed.success) {
    const data = parsed.data;
    return {
      id,
      customerId: data.customer_id,
      paymentMethod: data.payment_method,
      shippingAddress: data.shipping_address,
      status: data.status,
      items: data.items,
      totalAmount: data.total_amount,
      totalPrice: data.total_amount,
      createdAt: data.created_at,
      statusUpdatedAt: data.status_updated_at,
      adminResponse: (data.admin_response || data.admin_note).trim(),
    };
  }

  const legacy = legacyOrderDocSchema.safeParse(raw);
  if (!legacy.success) {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    const data = raw as Record<string, unknown>;
    const customerId =
      typeof data.customer_id === "string"
        ? data.customer_id
        : typeof data.userId === "string"
        ? data.userId
        : null;
    if (!customerId) {
      return null;
    }

    const parseTimestampLoose = (value: unknown): Timestamp | null => {
      if (value instanceof Timestamp) return value;
      if (typeof value === "number") return Timestamp.fromMillis(value);
      if (typeof value === "string") {
        const ms = Date.parse(value);
        if (!Number.isNaN(ms)) return Timestamp.fromMillis(ms);
      }
      return null;
    };

    const rawStatus = typeof data.status === "string" ? data.status : "pending";
    const status: OrderStatus =
      rawStatus === "confirmed" || rawStatus === "shipping" || rawStatus === "delivered" || rawStatus === "cancelled"
        ? rawStatus
        : "pending";

    const totalAmountRaw = data.total_amount ?? data.totalPrice;
    const totalAmount = typeof totalAmountRaw === "number" ? totalAmountRaw : Number(totalAmountRaw ?? 0);
    const itemsRaw = Array.isArray(data.items) ? data.items : [];
    const items: OrderItem[] = itemsRaw
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const row = item as Record<string, unknown>;
        const productId = typeof row.productId === "string" ? row.productId : "";
        const productName =
          typeof row.productName === "string" ? row.productName : typeof row.name === "string" ? row.name : "";
        const unitPriceRaw = row.unitPrice ?? row.price;
        const unitPrice = typeof unitPriceRaw === "number" ? unitPriceRaw : Number(unitPriceRaw ?? 0);
        const quantityRaw = row.quantity;
        const quantity = typeof quantityRaw === "number" ? quantityRaw : Number(quantityRaw ?? 0);
        const image = typeof row.image === "string" ? row.image : "";
        if (!productId || !productName || !image || !Number.isFinite(unitPrice) || !Number.isFinite(quantity) || quantity <= 0) {
          return null;
        }
        return { productId, productName, unitPrice, quantity, image };
      })
      .filter((item): item is OrderItem => item !== null);

    const nestedShipping =
      data.shipping_address && typeof data.shipping_address === "object"
        ? (data.shipping_address as Record<string, unknown>)
        : null;
    const shippingAddress: ShippingAddress = {
      fullName:
        (nestedShipping && typeof nestedShipping.fullName === "string" ? nestedShipping.fullName : null) ??
        (typeof data.fullName === "string" ? data.fullName : ""),
      phone:
        (nestedShipping && typeof nestedShipping.phone === "string" ? nestedShipping.phone : null) ??
        (typeof data.phone === "string" ? data.phone : ""),
      region:
        (nestedShipping && typeof nestedShipping.region === "string" ? nestedShipping.region : null) ??
        (typeof data.region === "string" ? data.region : ""),
      address:
        (nestedShipping && typeof nestedShipping.address === "string" ? nestedShipping.address : null) ??
        (typeof data.address === "string" ? data.address : ""),
      comment:
        (nestedShipping && typeof nestedShipping.comment === "string" ? nestedShipping.comment : null) ??
        (typeof data.comment === "string" ? data.comment : ""),
    };

    return {
      id,
      customerId,
      paymentMethod: typeof data.payment_method === "string" ? data.payment_method : typeof data.paymentMethod === "string" ? data.paymentMethod : "",
      shippingAddress,
      status,
      items,
      totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
      totalPrice: Number.isFinite(totalAmount) ? totalAmount : 0,
      createdAt: parseTimestampLoose(data.created_at ?? data.createdAt),
      statusUpdatedAt: parseTimestampLoose(data.status_updated_at ?? data.updatedAt),
      adminResponse:
        (typeof data.admin_response === "string" ? data.admin_response : typeof data.adminResponse === "string" ? data.adminResponse : "") ||
        (typeof data.admin_note === "string" ? data.admin_note : typeof data.adminNote === "string" ? data.adminNote : ""),
    };
  }

  const legacyItems: OrderItem[] = legacy.data.items.map((item) => ({
    productId: item.productId,
    productName: item.name,
    unitPrice: item.price,
    quantity: item.quantity,
    image: item.image,
  }));

  return {
    id,
    customerId: legacy.data.userId,
    paymentMethod: legacy.data.paymentMethod,
    shippingAddress: {
      fullName: legacy.data.fullName,
      phone: legacy.data.phone,
      region: legacy.data.region,
      address: legacy.data.address,
      comment: legacy.data.comment,
    },
    status: legacy.data.status,
    items: legacyItems,
    totalAmount: legacy.data.totalPrice,
    totalPrice: legacy.data.totalPrice,
    createdAt: legacy.data.createdAt,
    statusUpdatedAt: legacy.data.updatedAt,
    adminResponse: (legacy.data.adminResponse || legacy.data.adminNote).trim(),
  };
};

export const subscribeToUserOrders = (
  userId: string,
  callback: (orders: Order[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const nextFieldQuery = query(collection(db, ORDERS_COLLECTION), where("customer_id", "==", userId));
  const legacyFieldQuery = query(collection(db, ORDERS_COLLECTION), where("userId", "==", userId));

  let nextDocs = new Map<string, Order>();
  let legacyDocs = new Map<string, Order>();
  let primaryFailed = false;

  const emit = () => {
    const merged = new Map<string, Order>([...legacyDocs, ...nextDocs]);
    const orders = [...merged.values()].sort(
      (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0)
    );
    callback(orders);
  };

  const handleSnapshot =
    (target: "next" | "legacy") =>
    (snapshot: QuerySnapshot<DocumentData>) => {
      const mapped = new Map<string, Order>();
      snapshot.docs.forEach((orderDoc) => {
        const parsed = parseOrder(orderDoc.id, orderDoc.data());
        if (parsed) {
          mapped.set(parsed.id, parsed);
        }
      });

      if (target === "next") {
        nextDocs = mapped;
      } else {
        legacyDocs = mapped;
      }
      emit();
    };

  const handleError = (error: Error) => {
    if (onError && !primaryFailed) {
      primaryFailed = true;
      onError(error);
    }
  };

  const unsubscribeNext = onSnapshot(nextFieldQuery, handleSnapshot("next"), handleError);
  const unsubscribeLegacy = onSnapshot(
    legacyFieldQuery,
    handleSnapshot("legacy"),
    () => {
      // Legacy query xatosi asosiy oqimni to'xtatmasin.
    }
  );

  return () => {
    unsubscribeNext();
    unsubscribeLegacy();
  };
};

export const subscribeToAllOrders = (
  callback: (orders: Order[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const q = query(collection(db, ORDERS_COLLECTION));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs
        .map((orderDoc) => parseOrder(orderDoc.id, orderDoc.data()))
        .filter((order): order is Order => order !== null)
        .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
      callback(orders);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
};
