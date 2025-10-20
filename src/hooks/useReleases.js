import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

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
        let constraints = [];

        if (filters.format) {
          constraints.push(where('formats.type', '==', filters.format));
        }

        if (filters.labelRef) {
          constraints.push(where('labelRef', '==', filters.labelRef));
        }

        if (filters.artistRef) {
          constraints.push(where('artistRef', '==', filters.artistRef));
        }

        if (filters.genre) {
          constraints.push(where('genres', 'array-contains', filters.genre));
        }

        if (filters.country) {
          constraints.push(where('country', '==', filters.country));
        }

        if (filters.inStock) {
          constraints.push(where('formats.stock', '>', 0));
        }

        if (filters.preOrder) {
          constraints.push(where('preorderAt', '!=', null));
        }

        switch (sortBy) {
          case 'newest':
            constraints.push(orderBy('releaseDate', 'desc'));
            break;
          case 'oldest':
            constraints.push(orderBy('releaseDate', 'asc'));
            break;
          case 'price-asc':
            constraints.push(orderBy('formats.price', 'asc'));
            break;
          case 'price-desc':
            constraints.push(orderBy('formats.price', 'desc'));
            break;
          default:
            constraints.push(orderBy('releaseDate', 'desc'));
        }

        constraints.push(limit(pageSize));

        if (lastDoc) {
          constraints.push(startAfter(lastDoc));
        }

        const q = query(releasesRef, ...constraints);
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
              ...data,
              artist,
              label,
              releaseDate: data.releaseDate?.toDate(),
              preorderAt: data.preorderAt?.toDate(),
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate()
            };
          })
        );

        setReleases(releasesData);
        setHasMore(querySnapshot.docs.length === pageSize);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      } catch (err) {
        if (err.code !== 'permission-denied' && err.code !== 'not-found') {
          console.error('Error fetching releases:', err);
        }
        setError(err);
        setReleases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, [JSON.stringify(filters), sortBy, pageSize, lastDoc]);

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
        const q = query(releasesRef, where('slug', '==', releaseId), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError(new Error('Release not found'));
          setLoading(false);
          return;
        }

        const docSnap = querySnapshot.docs[0];
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

        setRelease({
          id: docSnap.id,
          ...data,
          artist,
          label,
          releaseDate: data.releaseDate?.toDate(),
          preorderAt: data.preorderAt?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        });
      } catch (err) {
        if (err.code !== 'permission-denied' && err.code !== 'not-found') {
          console.error('Error fetching release:', err);
        }
        setError(err);
        setRelease(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRelease();
  }, [releaseId]);

  return { release, loading, error };
}
