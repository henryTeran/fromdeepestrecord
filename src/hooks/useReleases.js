import { useState, useEffect } from 'react';

export function useReleases(filters = {}, sortBy = 'newest', pageSize = 24, lastDoc = null) {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);

  useEffect(() => {
    console.warn('Firebase not installed - useReleases placeholder');
    setLoading(false);
  }, [JSON.stringify(filters), sortBy, pageSize, lastDoc]);

  return { releases, loading, error, hasMore, lastVisible };
}

export function useRelease(releaseId) {
  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.warn('Firebase not installed - useRelease placeholder');
    setLoading(false);
  }, [releaseId]);

  return { release, loading, error };
}
