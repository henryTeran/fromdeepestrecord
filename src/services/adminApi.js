import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

export const adminApi = {
  releases: {
    create: async (data) => {
      const createRelease = httpsCallable(functions, 'adminCreateRelease');
      const result = await createRelease(data);
      return result.data;
    },

    update: async (id, data) => {
      const updateRelease = httpsCallable(functions, 'adminUpdateRelease');
      const result = await updateRelease({ id, ...data });
      return result.data;
    },

    delete: async (id, hard = false) => {
      const deleteRelease = httpsCallable(functions, 'adminDeleteRelease');
      const result = await deleteRelease({ id, hard });
      return result.data;
    },

    list: async (filters = {}) => {
      return { items: [], total: 0 };
    },
  },

  merch: {
    create: async (data) => {
      const createMerch = httpsCallable(functions, 'adminCreateMerch');
      const result = await createMerch(data);
      return result.data;
    },

    update: async (id, data) => {
      const updateMerch = httpsCallable(functions, 'adminUpdateMerch');
      const result = await updateMerch({ id, ...data });
      return result.data;
    },

    delete: async (id, hard = false) => {
      const deleteMerch = httpsCallable(functions, 'adminDeleteMerch');
      const result = await deleteMerch({ id, hard });
      return result.data;
    },

    list: async (filters = {}) => {
      return { items: [], total: 0 };
    },
  },

  contact: {
    submit: async (data) => {
      const submitContact = httpsCallable(functions, 'submitContact');
      const result = await submitContact(data);
      return result.data;
    },

    updateStatus: async (id, status) => {
      const updateStatus = httpsCallable(functions, 'adminUpdateContactStatus');
      const result = await updateStatus({ id, status });
      return result.data;
    },

    list: async (filters = {}) => {
      return { items: [], total: 0 };
    },
  },

  storage: {
    getUploadUrl: async (path, contentType) => {
      const getUrl = httpsCallable(functions, 'getSignedUploadUrl');
      const result = await getUrl({ path, contentType });
      return result.data;
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
