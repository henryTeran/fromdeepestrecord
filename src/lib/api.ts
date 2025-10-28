const BASE = import.meta.env.DEV
  ? "http://127.0.0.1:5001/deepestrecords/us-central1"
  : "https://us-central1-deepestrecords.cloudfunctions.net";

async function api(path: string, data?: any, init?: RequestInit) {
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

export const AdminApi = {
  createMerch: (payload: any) => api("adminCreateMerch", payload),
  updateMerch: (payload: any) => api("adminUpdateMerch", payload),
  deleteMerch: (payload: any) => api("adminDeleteMerch", payload),
  getSignedUploadUrl: (fileName: string, contentType: string) =>
    api("getSignedUploadUrl", { fileName, contentType }),
  submitContact: (payload: any) => api("submitContact", payload),
};
