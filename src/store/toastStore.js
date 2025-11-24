import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],
  
  addToast: (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }]
    }));
    
    if (duration) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        }));
      }, duration);
    }
    
    return id;
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },
  
  success: (message, duration) => {
    return useToastStore.getState().addToast(message, 'success', duration);
  },
  
  error: (message, duration) => {
    return useToastStore.getState().addToast(message, 'error', duration);
  },
  
  info: (message, duration) => {
    return useToastStore.getState().addToast(message, 'info', duration);
  },
  
  warning: (message, duration) => {
    return useToastStore.getState().addToast(message, 'warning', duration);
  },
}));
