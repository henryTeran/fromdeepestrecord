import { useState, useEffect } from 'react';

export function useDocument(collectionName, documentId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.warn('Firebase not installed - useDocument placeholder');
    setLoading(false);
  }, [collectionName, documentId]);

  return { data, loading, error };
}

export function useCollection(collectionName, constraints = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.warn('Firebase not installed - useCollection placeholder');
    setLoading(false);
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
}

export function useRealtimeDocument(collectionName, documentId) {
  return useDocument(collectionName, documentId);
}

export function useRealtimeCollection(collectionName, constraints = []) {
  return useCollection(collectionName, constraints);
}

export async function resolveRef(ref) {
  console.warn('Firebase not installed');
  return null;
}

export async function resolveRefs(refs) {
  console.warn('Firebase not installed');
  return [];
}
