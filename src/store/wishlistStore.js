import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useToastStore } from './toastStore';

export const useWishlistStore = create(persist(
  (set, get) => ({
    wishlist: [],
    
    addToWishlist: (product) => {
      const exists = get().wishlist.find(p => p.id === product.id);
      if (!exists) {
        set({ wishlist: [...get().wishlist, product] });
        useToastStore.getState().success('Added to wishlist');
      }
    },
    
    removeFromWishlist: (id) => {
      set({ wishlist: get().wishlist.filter(p => p.id !== id) });
      useToastStore.getState().info('Removed from wishlist');
    },
    
    clearWishlist: () => {
      set({ wishlist: [] });
    },
    
    isInWishlist: (id) => {
      return get().wishlist.some(p => p.id === id);
    }
  }),
  {
    name: 'fromdeepest-wishlist-storage',
  }
));
