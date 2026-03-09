import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { User } from "firebase/auth";

export interface UserProfile {
  fullName: string;
  phone: string;
  region: string;
  address: string;
}

const USERS_COLLECTION = "users";

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Profilni olishda xatolik:", error);
    return null;
  }
};

export const updateUserProfile = async (
  user: User,
  profileData: Partial<UserProfile>
): Promise<void> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, { ...profileData });
    } else {
      // Yangi profil yaratish
      await setDoc(docRef, {
        fullName: profileData.fullName || user.displayName || "",
        phone: profileData.phone || "",
        region: profileData.region || "",
        address: profileData.address || "",
      });
    }
  } catch (error) {
    console.error("Profilni saqlashda xatolik:", error);
    throw error;
  }
};
