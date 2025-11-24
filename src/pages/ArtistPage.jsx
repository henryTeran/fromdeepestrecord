import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import ProductSuggestions from '../components/ProductSuggestions';
import Head from '../seo/Head';
import { Loader2 } from 'lucide-react';

export default function ArtistPage() {
  const { slug } = useParams();
  const [artist, setArtist] = useState(null);
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistAndReleases = async () => {
      if (!db) {
        console.warn('Firebase not configured');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { collection, query, where, getDocs, limit, doc, getDoc } = await import('firebase/firestore');

        const artistsRef = collection(db, 'artists');
        const artistQuery = query(artistsRef, where('slug', '==', slug), limit(1));
        const artistSnapshot = await getDocs(artistQuery);

        if (artistSnapshot.empty) {
          console.error('Artist not found');
          setLoading(false);
          return;
        }

        const artistDoc = artistSnapshot.docs[0];
        const artistData = { id: artistDoc.id, ...artistDoc.data() };
        setArtist(artistData);

        const artistRef = doc(db, 'artists', artistDoc.id);
        const releasesRef = collection(db, 'releases');
        const releasesQuery = query(
          releasesRef,
          where('artistRef', '==', artistRef),
          limit(50)
        );
        const releasesSnapshot = await getDocs(releasesQuery);

        const releasesData = await Promise.all(
          releasesSnapshot.docs.map(async (releaseDoc) => {
            const data = releaseDoc.data();
            let label = null;

            if (data.labelRef) {
              const labelSnap = await getDoc(data.labelRef);
              if (labelSnap.exists()) {
                label = { id: labelSnap.id, ...labelSnap.data() };
              }
            }

            return {
              id: releaseDoc.id,
              ...data,
              label,
              releaseDate: data.releaseDate?.toDate(),
              preorderAt: data.preorderAt?.toDate()
            };
          })
        );

        setReleases(releasesData);
      } catch (error) {
        console.error('Error fetching artist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistAndReleases();
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

  if (!artist) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Artist not found</div>
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
      band: artist.name,
      price: lowestPrice,
      image: release.cover,
      category: 'artist'
    };
  });

  return (
    <>
      <Head
        title={`${artist.name} - From Deepest Record`}
        description={artist.bio || `Browse all releases from ${artist.name}. ${releases.length} titles available.`}
        image={artist.image}
      />
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-zinc-800/50 rounded-lg p-8 mb-12">
            <div className="flex items-start gap-8">
              {artist.image && (
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{artist.name}</h1>
                {artist.country && (
                  <p className="text-gray-400 mb-4">{artist.country}</p>
                )}
                {artist.bio && (
                  <p className="text-gray-300 leading-relaxed">{artist.bio}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">
              Discography ({releases.length})
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
