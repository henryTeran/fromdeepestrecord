import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Helper pour convertir les timestamps Firestore de manière sécurisée
const safeToDate = (timestamp) => {
  if (!timestamp) return null;
  if (typeof timestamp?.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  return null;
};

// Convertit récursivement tous les timestamps Firestore en Date
const convertTimestamps = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Si c'est un timestamp Firestore
  if (typeof obj.toDate === 'function') {
    return safeToDate(obj);
  }
  
  // Si c'est un tableau
  if (Array.isArray(obj)) {
    return obj.map(item => convertTimestamps(item));
  }
  
  // Si c'est un objet
  const converted = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      converted[key] = convertTimestamps(obj[key]);
    }
  }
  return converted;
};

export function useReleases(filters = {}, sortBy = 'newest', pageSize = 24, lastDoc = null) {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        setLoading(true);
        const releasesRef = collection(db, 'releases');
        
        // Simple query without complex filters to avoid index requirements
        const q = query(
          releasesRef,
          orderBy('createdAt', 'desc'),
          limit(100)
        );
        
        const querySnapshot = await getDocs(q);

        const releasesData = await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();

            let artist = null;
            let label = null;

            if (data.artistRef) {
              const artistSnap = await getDoc(data.artistRef);
              if (artistSnap.exists()) {
                artist = { id: artistSnap.id, ...artistSnap.data() };
              }
            }

            if (data.labelRef) {
              const labelSnap = await getDoc(data.labelRef);
              if (labelSnap.exists()) {
                label = { id: labelSnap.id, ...labelSnap.data() };
              }
            }

            return {
              id: docSnap.id,
              ...convertTimestamps(data),
              artist,
              label
            };
          })
        );

        // Client-side filtering
        let filteredReleases = releasesData;

        // Filter by format
        if (filters.format) {
          filteredReleases = filteredReleases.filter(release => {
            if (!release.formats || !Array.isArray(release.formats)) return false;
            return release.formats.some(format => format.type === filters.format);
          });
        }

        // Filter by label
        if (filters.labelRef) {
          filteredReleases = filteredReleases.filter(release => 
            release.labelRef?.id === filters.labelRef?.id
          );
        }

        // Filter by artist
        if (filters.artistRef) {
          filteredReleases = filteredReleases.filter(release => 
            release.artistRef?.id === filters.artistRef?.id
          );
        }

        // Filter by genre
        if (filters.genre) {
          filteredReleases = filteredReleases.filter(release => {
            if (!release.genres || !Array.isArray(release.genres)) return false;
            return release.genres.includes(filters.genre);
          });
        }

        // Filter by country
        if (filters.country) {
          filteredReleases = filteredReleases.filter(release => 
            release.country === filters.country
          );
        }

        // Filter by stock
        if (filters.inStock) {
          filteredReleases = filteredReleases.filter(release => {
            if (!release.formats || !Array.isArray(release.formats)) return false;
            return release.formats.some(format => (format.stock || 0) > 0);
          });
        }

        // Filter by preorder
        if (filters.preOrder) {
          filteredReleases = filteredReleases.filter(release => 
            release.preorderAt != null
          );
        }

        // Client-side sorting
        filteredReleases.sort((a, b) => {
          switch (sortBy) {
            case 'newest':
              return (b.releaseDate?.getTime() || 0) - (a.releaseDate?.getTime() || 0);
            case 'oldest':
              return (a.releaseDate?.getTime() || 0) - (b.releaseDate?.getTime() || 0);
            case 'price-asc': {
              const priceA = a.formats?.[0]?.price || 0;
              const priceB = b.formats?.[0]?.price || 0;
              return priceA - priceB;
            }
            case 'price-desc': {
              const priceC = a.formats?.[0]?.price || 0;
              const priceD = b.formats?.[0]?.price || 0;
              return priceD - priceC;
            }
            default:
              return (b.releaseDate?.getTime() || 0) - (a.releaseDate?.getTime() || 0);
          }
        });

        // Pagination (client-side)
        const paginatedReleases = filteredReleases.slice(0, pageSize);

        setReleases(paginatedReleases);
        setHasMore(filteredReleases.length > pageSize);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      } catch (err) {
        console.error('Error fetching releases:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, [filters.format, filters.labelRef, filters.artistRef, filters.genre, filters.country, filters.inStock, filters.preOrder, sortBy, pageSize, lastDoc]);

  return { releases, loading, error, hasMore, lastVisible };
}

export function useRelease(releaseId) {
  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!releaseId) {
      setLoading(false);
      return;
    }

    const fetchRelease = async () => {
      try {
        setLoading(true);
        const releasesRef = collection(db, 'releases');
        // Fetch all releases and filter client-side to avoid index requirements
        const q = query(releasesRef, limit(100));
        const querySnapshot = await getDocs(q);

        // Find release by slug client-side
        const releaseDoc = querySnapshot.docs.find(doc => 
          doc.data().slug === releaseId || doc.id === releaseId
        );

        if (!releaseDoc) {
          setError(new Error('Release not found'));
          setLoading(false);
          return;
        }

        const data = releaseDoc.data();

        let artist = null;
        let label = null;

        if (data.artistRef) {
          const artistSnap = await getDoc(data.artistRef);
          if (artistSnap.exists()) {
            artist = { id: artistSnap.id, ...artistSnap.data() };
          }
        }

        if (data.labelRef) {
          const labelSnap = await getDoc(data.labelRef);
          if (labelSnap.exists()) {
            label = { id: labelSnap.id, ...labelSnap.data() };
          }
        }

        setRelease({
          id: releaseDoc.id,
          ...convertTimestamps(data),
          artist,
          label
        });
      } catch (err) {
        console.error('Error fetching release:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelease();
  }, [releaseId]);

  return { release, loading, error };
}
