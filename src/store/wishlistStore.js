import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(persist(
  (set, get) => ({
    wishlist: [],
    addToWishlist: (product) => {
      const exists = get().wishlist.find(p => p.id === product.id);
      if (!exists) {
        set({ wishlist: [...get().wishlist, product] });
      }
    },
    removeFromWishlist: (id) => {
      set({ wishlist: get().wishlist.filter(p => p.id !== id) });
    },
    isInWishlist: (id) => {
      return get().wishlist.some(p => p.id === id);
    }
  }),
  {
    name: 'fromdeepest-wishlist-storage',
  }
));
