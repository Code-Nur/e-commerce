import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product } from "@/data/products";
import { parseProduct } from "./catalogParsers";

const PRODUCTS_COLLECTION = "products";

export const subscribeProducts = (
  callback: (products: Product[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const productsRef = collection(db, PRODUCTS_COLLECTION);

  return onSnapshot(
    productsRef,
    (snapshot) => {
      const products = snapshot.docs
        .map((productDoc) => parseProduct(productDoc.id, productDoc.data()))
        .filter((product): product is Product => product !== null)
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      callback(products);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
};

export const subscribeProductById = (
  productId: string,
  callback: (product: Product | null) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId);

  return onSnapshot(
    productRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      callback(parseProduct(snapshot.id, snapshot.data()));
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  const snapshot = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));
  if (!snapshot.exists()) {
    return null;
  }
  return parseProduct(snapshot.id, snapshot.data());
};
