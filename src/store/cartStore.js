import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, getDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useToastStore } from './toastStore';

let unsubscribeFirestore = null;
let currentUser = null;
let isInitialized = false;

const syncToFirestore = async (cart) => {
  if (!currentUser) return;

  try {
    const cartRef = doc(db, 'carts', currentUser.uid);
    await setDoc(cartRef, {
      items: cart,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Error syncing cart to Firestore:', error);
  }
};

export const useCartStore = create(persist(
  (set, get) => ({
    cart: [],
    isHydrated: false,

    setHydrated: (hydrated) => set({ isHydrated: hydrated }),

    initializeAuth: () => {
      if (isInitialized) return;
      isInitialized = true;

      onAuthStateChanged(auth, async (user) => {
        // Nettoyer l'ancien listener
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }

        if (user) {
          currentUser = user;
          
          // Récupérer le panier depuis Firestore (source of truth)
          const cartRef = doc(db, 'carts', user.uid);
          const cartSnap = await getDoc(cartRef);

          if (cartSnap.exists()) {
            const firestoreCart = cartSnap.data().items || [];
            set({ cart: firestoreCart });
          } else {
            // Pas de panier en Firestore, sync le panier local s'il existe
            const localCart = get().cart;
            if (localCart.length > 0) {
              await syncToFirestore(localCart);
            } else {
              set({ cart: [] });
            }
          }

          // Écouter les changements sans re-merge
          const cartDoc = await getDoc(cartRef);
          if (cartDoc.exists() || get().cart.length > 0) {
            unsubscribeFirestore = onSnapshot(
              cartRef,
              (snapshot) => {
                if (snapshot.exists()) {
                  const firestoreCart = snapshot.data().items || [];
                  set({ cart: firestoreCart });
                } else {
                  set({ cart: [] });
                }
              },
              (error) => {
                if (error.code !== 'permission-denied') {
                  console.error('Cart snapshot error:', error);
                }
              }
            );
          }
        } else {
          // Déconnexion = reset complet
          currentUser = null;
          set({ cart: [] });
        }
      });
    },

    addToCart: (product) => {
      const cart = get().cart;
      const matchKey = product.sku
        ? `${product.id}-${product.sku}`
        : product.id;

      const exists = cart.find(item => {
        const itemKey = item.sku ? `${item.id}-${item.sku}` : item.id;
        return itemKey === matchKey;
      });

      let newCart;
      if (!exists) {
        newCart = [...cart, { ...product, quantity: product.quantity || 1 }];
        useToastStore.getState().success('Added to cart');
      } else {
        newCart = cart.map(item => {
          const itemKey = item.sku ? `${item.id}-${item.sku}` : item.id;
          return itemKey === matchKey
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item;
        });
        useToastStore.getState().success('Cart updated');
      }

      set({ cart: newCart });
      syncToFirestore(newCart);
    },

    updateQuantity: (id, sku, quantity) => {
      const newCart = get().cart.map(item => {
        const matches = sku
          ? (item.id === id && item.sku === sku)
          : item.id === id;

        return matches ? { ...item, quantity } : item;
      });

      set({ cart: newCart });
      syncToFirestore(newCart);
    },

    removeFromCart: (id, sku) => {
      const newCart = get().cart.filter(item => {
        if (sku) {
          return !(item.id === id && item.sku === sku);
        }
        return item.id !== id;
      });

      set({ cart: newCart });
      syncToFirestore(newCart);
      useToastStore.getState().info('Removed from cart');
    },

    clearCart: async () => {
      set({ cart: [] });

      if (currentUser) {
        try {
          const cartRef = doc(db, 'carts', currentUser.uid);
          await deleteDoc(cartRef);
        } catch (error) {
          console.error('Error clearing cart from Firestore:', error);
        }
      }
    },
  }),
  {
    name: 'fromdeepest-cart-storage',
    onRehydrateStorage: () => (state) => {
      if (state) {
        state.setHydrated(true);
        state.initializeAuth();
      }
    },
  }
));
