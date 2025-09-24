import { useState, useCallback } from 'react';
import { enrichRelease } from '../../services/musicMeta';

/**
 * Hook for enriching product metadata
 * @returns {Object} Hook state and functions
 */
export function useEnrich() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const run = useCallback(async ({ artist, title, barcode }) => {
    if (!artist || !title) {
      setError('Artist and title are required');
      return null;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const enrichedData = await enrichRelease({ artist, title, barcode });
      setData(enrichedData);
      return enrichedData;
    } catch (err) {
      const errorMessage = err.message || 'Failed to enrich product data';
      setError(errorMessage);
      console.error('Enrichment error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setData(null);
    setError(null);
  }, []);

  return {
    loading,
    data,
    error,
    run,
    reset
  };
}