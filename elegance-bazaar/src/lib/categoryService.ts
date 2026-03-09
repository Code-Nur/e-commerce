import { collection, onSnapshot, query, orderBy, Unsubscribe } from "firebase/firestore";
import { db } from "./firebase";
import type { Category } from "@/data/products";
import { parseCategory } from "./catalogParsers";

const CATEGORIES_COLLECTION = "categories";

export const subscribeCategories = (
  callback: (categories: Category[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const q = query(collection(db, CATEGORIES_COLLECTION), orderBy("name", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const categories = snapshot.docs
        .map((categoryDoc) => parseCategory(categoryDoc.id, categoryDoc.data()))
        .filter((category): category is Category => category !== null);
      callback(categories);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
};
