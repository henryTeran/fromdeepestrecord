import { httpsCallable } from 'firebase/functions';
import { fx } from '../lib/firebase';

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
    getUploadUrl: async (path, contentType) => {
      return callFunction('getSignedUploadUrl', { path, contentType });
    },

    uploadFile: async (file, path) => {
      const contentType = file.type;
      const { uploadUrl, publicUrl } = await adminApi.storage.getUploadUrl(path, contentType);

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      return publicUrl;
    },
  },
};
