import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { fx, storage } from '../lib/firebase';

const callFunction = async (name, data) => {
  const fn = httpsCallable(fx, name);
  const result = await fn(data);
  return result.data;
};

export const adminApi = {
  releases: {
    create: async (data) => {
      return callFunction('adminCreateRelease', data);
    },

    update: async (id, data) => {
      return callFunction('adminUpdateRelease', { id, ...data });
    },

    delete: async (id, hard = false) => {
      return callFunction('adminDeleteRelease', { id, hard });
    },

    list: async (filters = {}) => {
      return { items: [], total: 0 };
    },
  },

  merch: {
    create: async (data) => {
      return callFunction('adminCreateMerch', data);
    },

    update: async (id, data) => {
      return callFunction('adminUpdateMerch', { id, ...data });
    },

    delete: async (id, hard = false) => {
      return callFunction('adminDeleteMerch', { id, hard });
    },

    list: async (filters = {}) => {
      return { items: [], total: 0 };
    },
  },

  deleteMerch: async (id) => {
    return callFunction('adminDeleteMerch', { id, hard: true });
  },

  contact: {
    submit: async (data) => {
      return callFunction('submitContact', data);
    },

    updateStatus: async (id, status) => {
      return callFunction('adminUpdateContactStatus', { id, status });
    },

    list: async (filters = {}) => {
      return { items: [], total: 0 };
    },
  },

  storage: {
    uploadFile: async (file, path) => {
      try {
        // Upload directly using Firebase Storage SDK (avoids CORS issues)
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file, {
          contentType: file.type,
        });
        
        // Get the download URL
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
      } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
      }
    },
  },
};
