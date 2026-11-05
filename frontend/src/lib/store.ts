import { create } from "zustand";
import { ProductProps } from "../../type";
import { persist } from "zustand/middleware";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

interface CartProduct extends ProductProps {
  quantity: number;
}

export interface UserType {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  id: string;
}

interface StoreType {
  // user
  currentUser: UserType | null;
  isLoading: boolean;
  getUserInfo: (uid: any) => Promise<void>;
  // cart
  cartProduct: CartProduct[];
  addToCart: (product: ProductProps) => Promise<void>;
  decreaseQuantity: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  resetCart: () => void;
  // favorite
  favoriteProduct: CartProduct[];
  addToFavorite: (product: ProductProps) => Promise<void>;
  removeFromFavorite: (productId: number) => void;
  resetFavorite: () => void;
}

// Custom storage object
const customStorage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name: string, value: any) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

export const store = create<StoreType>()(
  persist(
    (set) => ({
      currentUser: null,
      isLoading: true,
      cartProduct: [],
      favoriteProduct: [],
      getUserInfo: async (uid: any) => {
        if (!uid) return set({ currentUser: null, isLoading: false });
        const user = auth.currentUser;
        if (!user || user.uid !== uid) return;
        const fallbackUser: UserType = {
          firstName: user.displayName || user.email?.split("@")[0] || "Customer",
          lastName: "",
          email: user.email || "",
          avatar: user.photoURL || "",
          id: user.uid,
        };
        set({ currentUser: fallbackUser, isLoading: false });

        try {
          const docRef = doc(db, "users", uid);
          const docSnap = await getDoc(docRef);
          if (auth.currentUser?.uid !== uid) return;
          if (docSnap.exists()) {
            const profile = docSnap.data();
            set({
              currentUser: {
                ...fallbackUser,
                ...profile,
                avatar: user.photoURL || profile.avatar || "",
                email: user.email || profile.email || "",
                id: uid,
              },
              isLoading: false,
            });
          }
        } catch (error) {
          console.log("useUserStore error: ", error);
        }
      },
      addToCart: (product: ProductProps) => {
        return new Promise<void>((resolve) => {
          set((state: StoreType) => {
            const existingProduct = state.cartProduct.find(
              (p) => p._id === product._id
            );

            if (existingProduct) {
              return {
                cartProduct: state.cartProduct.map((p) =>
                  p._id === product._id
                    ? { ...p, quantity: (p.quantity || 0) + 1 }
                    : p
                ),
              };
            } else {
              return {
                cartProduct: [
                  ...state.cartProduct,
                  { ...product, quantity: 1 },
                ],
              };
            }
          });
          resolve();
        });
      },
      decreaseQuantity: (productId: number) => {
        set((state: StoreType) => {
          const existingProduct = state.cartProduct.find(
            (p) => p._id === productId
          );

          if (existingProduct) {
            return {
              cartProduct: state.cartProduct.map((p) =>
                p._id === productId
                  ? { ...p, quantity: Math.max(p.quantity - 1, 1) }
                  : p
              ),
            };
          } else {
            return state;
          }
        });
      },
      removeFromCart: (productId: number) => {
        set((state: StoreType) => ({
          cartProduct: state.cartProduct.filter(
            (item) => item._id !== productId
          ),
        }));
      },
      resetCart: () => {
        set({ cartProduct: [] });
      },
      addToFavorite: (product: ProductProps) => {
        return new Promise<void>((resolve) => {
          set((state: StoreType) => {
            const isFavorite = state.favoriteProduct.some(
              (item) => item._id === product._id
            );
            return {
              favoriteProduct: isFavorite
                ? state.favoriteProduct.filter(
                    (item) => item._id !== product._id
                  )
                : [...state.favoriteProduct, { ...product }],
            };
          });
          resolve();
        });
      },
      removeFromFavorite: (productId: number) => {
        set((state: StoreType) => ({
          favoriteProduct: state.favoriteProduct.filter(
            (item) => item._id !== productId
          ),
        }));
      },
      resetFavorite: () => {
        set({ favoriteProduct: [] });
      },
    }),
    {
      name: "store-storage",
      storage: customStorage,
      partialize: (state) => ({
        cartProduct: state.cartProduct,
        favoriteProduct: state.favoriteProduct,
      }),
      merge: (persistedState, currentState) => {
        const saved = persistedState as Partial<StoreType> | undefined;
        return {
          ...currentState,
          cartProduct: saved?.cartProduct || [],
          favoriteProduct: saved?.favoriteProduct || [],
        };
      },
    }
  )
);
