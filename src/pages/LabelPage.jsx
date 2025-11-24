import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import ProductSuggestions from '../components/ProductSuggestions';
import Head from '../seo/Head';
import { Loader2 } from 'lucide-react';

const safeToDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  return null;
};

export default function LabelPage() {
  const { slug } = useParams();
  const [label, setLabel] = useState(null);
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabelAndReleases = async () => {
      if (!db) {
        console.warn('Firebase not configured');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { collection, query, where, getDocs, limit, doc, getDoc } = await import('firebase/firestore');

        const labelsRef = collection(db, 'labels');
        const labelQuery = query(labelsRef, where('slug', '==', slug), limit(1));
        const labelSnapshot = await getDocs(labelQuery);

        if (labelSnapshot.empty) {
          console.error('Label not found');
          setLoading(false);
          return;
        }

        const labelDoc = labelSnapshot.docs[0];
        const labelData = { id: labelDoc.id, ...labelDoc.data() };
        setLabel(labelData);

        const labelRef = doc(db, 'labels', labelDoc.id);
        const releasesRef = collection(db, 'releases');
        const releasesQuery = query(
          releasesRef,
          where('labelRef', '==', labelRef),
          limit(50)
        );
        const releasesSnapshot = await getDocs(releasesQuery);

        const releasesData = await Promise.all(
          releasesSnapshot.docs.map(async (releaseDoc) => {
            const data = releaseDoc.data();
            let artist = null;

            if (data.artistRef) {
              const artistSnap = await getDoc(data.artistRef);
              if (artistSnap.exists()) {
                artist = { id: artistSnap.id, ...artistSnap.data() };
              }
            }

            return {
              id: releaseDoc.id,
              ...data,
              artist,
              releaseDate: safeToDate(data.releaseDate),
              preorderAt: safeToDate(data.preorderAt)
            };
          })
        );

        setReleases(releasesData);
      } catch (error) {
        console.error('Error fetching label:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabelAndReleases();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-gray-300">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!label) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Label not found</div>
        </div>
        <Footer />
      </>
    );
  }

  const releasesForDisplay = releases.map(release => {
    const lowestPrice = release.formats?.length > 0
      ? Math.min(...release.formats.map(f => f.price))
      : 0;

    return {
      id: release.id,
      title: release.title,
      band: release.artist?.name || 'Unknown Artist',
      price: lowestPrice,
      image: release.cover,
      category: 'label'
    };
  });

  return (
    <>
      <Head
        title={`${label.name} - From Deepest Record`}
        description={`Browse all releases from ${label.name}. ${releases.length} titles available.`}
        image={label.logo}
      />
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-zinc-800/50 rounded-lg p-8 mb-12">
            <div className="flex items-start gap-8">
              {label.logo && (
                <img
                  src={label.logo}
                  alt={label.name}
                  className="w-32 h-32 object-cover rounded-lg"
                  loading="lazy"
                />
              )}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{label.name}</h1>
                {label.country && (
                  <p className="text-gray-400 mb-4">{label.country}</p>
                )}
                {label.url && (
                  <a
                    href={label.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    Official Website →
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">
              Releases ({releases.length})
            </h2>
          </div>

          <ProductSuggestions
            title=""
            products={releasesForDisplay}
            showViewAll={false}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}
