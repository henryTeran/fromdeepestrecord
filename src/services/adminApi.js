const BASE = import.meta.env.DEV
  ? "http://127.0.0.1:5001/deepestrecords/us-central1"
  : "https://us-central1-deepestrecords.cloudfunctions.net";

async function api(path, data, init) {
  const res = await fetch(`${BASE}/${path}`, {
    method: init?.method || "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body: data ? JSON.stringify(data) : undefined,
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

export const adminApi = {
  releases: {
    create: async (data) => {
      return api("adminCreateRelease", data);
    },

    update: async (id, data) => {
      return api("adminUpdateRelease", { id, ...data });
    },

    delete: async (id, hard = false) => {
      return api("adminDeleteRelease", { id, hard });
    },

    list: async (filters = {}) => {
      return { items: [], total: 0 };
    },
  },

  merch: {
    create: async (data) => {
      return api("adminCreateMerch", data);
    },

    update: async (id, data) => {
      return api("adminUpdateMerch", { id, ...data });
    },

    delete: async (id, hard = false) => {
      return api("adminDeleteMerch", { id, hard });
    },

    list: async (filters = {}) => {
      return { items: [], total: 0 };
    },
  },

  contact: {
    submit: async (data) => {
      return api("submitContact", data);
    },

    updateStatus: async (id, status) => {
      return api("adminUpdateContactStatus", { id, status });
    },

    list: async (filters = {}) => {
      return { items: [], total: 0 };
    },
  },

  storage: {
    getUploadUrl: async (path, contentType) => {
      return api("getSignedUploadUrl", { path, contentType });
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
