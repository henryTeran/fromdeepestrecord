import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Hook pour récupérer les articles merch depuis Firestore
 * @param {Object} filters - Filtres optionnels (category, inStock, etc.)
 * @param {string} sortBy - Critère de tri ('newest', 'price-asc', 'price-desc')
 * @param {number} limitCount - Nombre maximum d'items à récupérer
 * @param {boolean} enabled - Si false, le hook ne fetch pas (défaut: true)
 * @returns {Object} { merchItems, loading, error }
 */
export const useMerch = (filters = {}, sortBy = 'newest', limitCount = 24, enabled = true) => {
  const [merchItems, setMerchItems] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  // Mémoriser les valeurs de filtres pour éviter les boucles infinies
  const categoryFilter = filters.category;
  const inStockFilter = filters.inStock;

  useEffect(() => {
    if (!enabled) {
      setMerchItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchMerch = async () => {
      try {
        setLoading(true);
        setError(null);

        let q = collection(db, 'merch');
        const constraints = [];

        // Tri (sans where pour éviter besoin d'index composite)
        let orderByField = 'createdAt';
        let orderByDirection = 'desc';

        if (sortBy === 'price-asc') {
          orderByField = 'price';
          orderByDirection = 'asc';
        } else if (sortBy === 'price-desc') {
          orderByField = 'price';
          orderByDirection = 'desc';
        } else if (sortBy === 'name-asc') {
          orderByField = 'name';
          orderByDirection = 'asc';
        } else if (sortBy === 'name-desc') {
          orderByField = 'name';
          orderByDirection = 'desc';
        }

        constraints.push(orderBy(orderByField, orderByDirection));
        // Fetch plus d'items pour compenser le filtrage côté client
        constraints.push(limit(limitCount * 3));

        q = query(q, ...constraints);

        console.log('[useMerch] Executing query, sortBy:', sortBy);
        const snapshot = await getDocs(q);
        console.log('[useMerch] Snapshot size:', snapshot.size);

        // Filtrer côté client pour éviter les index composites
        const items = snapshot.docs
          .map(doc => {
            const data = doc.data();
            
            // Extraire la première image de l'array images
            let coverImage = '';
            if (data.images && Array.isArray(data.images) && data.images.length > 0) {
              coverImage = data.images[0];
            } else if (data.image) {
              coverImage = data.image;
            } else if (data.cover) {
              coverImage = data.cover;
            }

            const item = {
              id: doc.id,
              title: data.name || data.title || 'Merch Item',
              artist: { name: 'Merchandise' },
              cover: coverImage,
              description: data.description || '',
              images: data.images || [],
              formats: [{
                type: data.category || 'Merch',
                name: data.name || 'Standard',
                price: data.price || 0,
                stock: data.stock || 0,
                sku: data.sku || doc.id,
                description: data.description || ''
              }],
              sizes: data.sizes || [],
              slug: doc.id,
              isMerch: true,
              createdAt: data.createdAt,
              exclusive: data.exclusive || false,
              preorderAt: data.preorderAt || null,
              seo: data.seo || {},
              // Données brutes pour filtrage
              _status: data.status,
              _category: data.category,
              _stock: data.stock || 0
            };
            
            return item;
          })
          // Filtrer par status active
          .filter(item => item._status === 'active')
          // Filtrer par catégorie si spécifié
          .filter(item => !categoryFilter || item._category === categoryFilter)
          // Filtrer par stock si spécifié
          .filter(item => !inStockFilter || item._stock > 0)
          // Limiter au nombre demandé
          .slice(0, limitCount);

        console.log('[useMerch] Loaded', items.length, 'active merch items');
        setMerchItems(items);
      } catch (err) {
        console.error('[useMerch] Error fetching merch:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMerch();
  }, [enabled, sortBy, limitCount, categoryFilter, inStockFilter]);

  return { merchItems, loading, error };
};
