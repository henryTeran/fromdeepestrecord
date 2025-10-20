import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf8')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const mockArtists = [
  {
    id: 'necromantic-worship',
    name: 'Necromantic Worship',
    country: 'Greece',
    slug: 'necromantic-worship',
    image: 'https://images.pexels.com/photos/2479312/pexels-photo-2479312.jpeg',
    bio: 'Greek death metal band formed in 2013, known for their raw and blasphemous sound.'
  },
  {
    id: 'morbid-execution',
    name: 'Morbid Execution',
    country: 'Sweden',
    slug: 'morbid-execution',
    image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
    bio: 'Swedish death metal outfit delivering brutal and uncompromising extreme metal.'
  },
  {
    id: 'sacrilegious-torment',
    name: 'Sacrilegious Torment',
    country: 'Finland',
    slug: 'sacrilegious-torment',
    image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
    bio: 'Finnish black/death metal band known for their occult themes and intense performances.'
  },
  {
    id: 'doom-enthroned',
    name: 'Doom Enthroned',
    country: 'USA',
    slug: 'doom-enthroned',
    image: 'https://images.pexels.com/photos/1164490/pexels-photo-1164490.jpeg',
    bio: 'American doom metal band combining crushing riffs with dark atmospheric elements.'
  }
];

const mockLabels = [
  {
    id: 'iron-bonehead',
    name: 'Iron Bonehead Productions',
    country: 'Germany',
    slug: 'iron-bonehead',
    url: 'https://ironbonehead.de',
    logo: 'https://images.pexels.com/photos/3944405/pexels-photo-3944405.jpeg'
  },
  {
    id: 'osmose',
    name: 'Osmose Productions',
    country: 'France',
    slug: 'osmose',
    url: 'https://osmoseproductions.com',
    logo: 'https://images.pexels.com/photos/3944454/pexels-photo-3944454.jpeg'
  },
  {
    id: 'nuclear-war-now',
    name: 'Nuclear War Now! Productions',
    country: 'USA',
    slug: 'nuclear-war-now',
    url: 'https://nwnprod.com',
    logo: 'https://images.pexels.com/photos/3944460/pexels-photo-3944460.jpeg'
  }
];

const mockReleases = [
  {
    id: 'blasphemous-death-ritual',
    title: 'Blasphemous Death Ritual',
    slug: 'blasphemous-death-ritual',
    artistRef: 'necromantic-worship',
    labelRef: 'iron-bonehead',
    catno: 'IBP-001',
    barcode: '123456789001',
    genres: ['Death Metal', 'Black Metal'],
    styles: ['Brutal', 'Raw', 'Old School'],
    country: 'Greece',
    releaseDate: new Date('2023-06-15'),
    cover: 'https://www.metal-archives.com/images/1/0/6/0/1060042.jpg?0935',
    gallery: [
      'https://www.metal-archives.com/images/1/0/6/0/1060042.jpg?0935',
      'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg'
    ],
    tracks: [
      { position: 1, title: 'Intro - Blasphemous Chants', length: '2:15' },
      { position: 2, title: 'Death Ritual', length: '4:32' },
      { position: 3, title: 'Necromantic Worship', length: '5:18' },
      { position: 4, title: 'Blood Sacrifice', length: '3:45' },
      { position: 5, title: 'Eternal Darkness', length: '6:12' }
    ],
    formats: [
      {
        sku: 'BLSDTH-LP-BLK',
        type: 'Vinyl',
        variantColor: 'Black',
        bundle: false,
        price: 24.99,
        stock: 50,
        stripePriceId: 'price_test_vinyl_black',
        exclusive: false,
        limited: false
      },
      {
        sku: 'BLSDTH-LP-RED',
        type: 'Vinyl',
        variantColor: 'Red',
        bundle: false,
        price: 29.99,
        stock: 25,
        stripePriceId: 'price_test_vinyl_red',
        exclusive: true,
        limited: true
      },
      {
        sku: 'BLSDTH-CD',
        type: 'CD',
        variantColor: '',
        bundle: false,
        price: 14.99,
        stock: 100,
        stripePriceId: 'price_test_cd',
        exclusive: false,
        limited: false
      }
    ],
    seo: {
      title: 'Blasphemous Death Ritual - Necromantic Worship | Vinyl & CD',
      description: 'Greek death metal masterpiece. Available on black and red vinyl, plus CD. Limited edition available.',
      images: ['https://www.metal-archives.com/images/1/0/6/0/1060042.jpg?0935']
    }
  },
  {
    id: 'eternal-crypt-of-darkness',
    title: 'Eternal Crypt of Darkness',
    slug: 'eternal-crypt-of-darkness',
    artistRef: 'morbid-execution',
    labelRef: 'osmose',
    catno: 'OSM-202',
    barcode: '123456789002',
    genres: ['Death Metal'],
    styles: ['Swedish', 'Old School'],
    country: 'Sweden',
    releaseDate: new Date('2023-09-20'),
    cover: 'https://www.metal-archives.com/images/2/7/9/9/279984.jpg?0436',
    gallery: [
      'https://www.metal-archives.com/images/2/7/9/9/279984.jpg?0436'
    ],
    tracks: [
      { position: 1, title: 'Awakening in the Crypt', length: '3:22' },
      { position: 2, title: 'Eternal Darkness', length: '4:15' },
      { position: 3, title: 'Morbid Visions', length: '5:01' },
      { position: 4, title: 'Cryptic Burial', length: '3:58' }
    ],
    formats: [
      {
        sku: 'ETCRPT-CD',
        type: 'CD',
        variantColor: '',
        bundle: false,
        price: 12.99,
        stock: 75,
        stripePriceId: 'price_test_cd_2',
        exclusive: false,
        limited: false
      }
    ],
    seo: {
      title: 'Eternal Crypt of Darkness - Morbid Execution | CD',
      description: 'Swedish death metal at its finest. Pure old school brutality on CD.',
      images: ['https://www.metal-archives.com/images/2/7/9/9/279984.jpg?0436']
    }
  },
  {
    id: 'witchblood-invocation',
    title: 'Witchblood Invocation',
    slug: 'witchblood-invocation',
    artistRef: 'sacrilegious-torment',
    labelRef: 'nuclear-war-now',
    catno: 'NWN-303',
    barcode: '123456789003',
    genres: ['Black Metal', 'Death Metal'],
    styles: ['Occult', 'Raw'],
    country: 'Finland',
    releaseDate: new Date('2024-01-15'),
    preorderAt: new Date('2024-03-01'),
    cover: 'https://www.metal-archives.com/images/1/0/3/7/1037682.jpg',
    gallery: [
      'https://www.metal-archives.com/images/1/0/3/7/1037682.jpg'
    ],
    tracks: [
      { position: 1, title: 'Invocation Rites', length: '6:45' },
      { position: 2, title: 'Witchblood Curse', length: '5:30' },
      { position: 3, title: 'Sacrilegious Ceremonies', length: '7:12' }
    ],
    formats: [
      {
        sku: 'WTCHBLD-LP-BLK',
        type: 'Vinyl',
        variantColor: 'Black',
        bundle: false,
        price: 19.99,
        stock: 8,
        stripePriceId: 'price_test_vinyl_preorder',
        exclusive: false,
        limited: false
      }
    ],
    seo: {
      title: 'Witchblood Invocation - Sacrilegious Torment | Vinyl Pre-order',
      description: 'Finnish black/death metal occult masterpiece. Pre-order now on black vinyl. Limited stock!',
      images: ['https://www.metal-archives.com/images/1/0/3/7/1037682.jpg']
    }
  },
  {
    id: 'funeral-march-of-the-damned',
    title: 'Funeral March of the Damned',
    slug: 'funeral-march-of-the-damned',
    artistRef: 'doom-enthroned',
    labelRef: 'iron-bonehead',
    catno: 'IBP-404',
    barcode: '123456789004',
    genres: ['Doom Metal', 'Death Metal'],
    styles: ['Atmospheric', 'Heavy'],
    country: 'USA',
    releaseDate: new Date('2023-11-10'),
    cover: 'https://www.metal-archives.com/images/3/4/8/7/348765.jpg',
    gallery: [
      'https://www.metal-archives.com/images/3/4/8/7/348765.jpg'
    ],
    tracks: [
      { position: 1, title: 'The Funeral Procession', length: '8:23' },
      { position: 2, title: 'March of the Damned', length: '6:45' },
      { position: 3, title: 'Enthroned in Darkness', length: '9:12' }
    ],
    formats: [
      {
        sku: 'FNRLMRCH-CD',
        type: 'CD',
        variantColor: '',
        bundle: false,
        price: 14.99,
        stock: 60,
        stripePriceId: 'price_test_cd_doom',
        exclusive: false,
        limited: false
      },
      {
        sku: 'FNRLMRCH-CASS',
        type: 'Cassette',
        variantColor: 'Clear',
        bundle: false,
        price: 9.99,
        stock: 30,
        stripePriceId: 'price_test_cassette',
        exclusive: false,
        limited: true
      }
    ],
    seo: {
      title: 'Funeral March of the Damned - Doom Enthroned | CD & Cassette',
      description: 'American doom/death metal crushing epic. Available on CD and limited clear cassette.',
      images: ['https://www.metal-archives.com/images/3/4/8/7/348765.jpg']
    }
  }
];

async function importData() {
  console.log('Starting data import...');

  try {
    console.log('\nImporting artists...');
    for (const artist of mockArtists) {
      await db.collection('artists').doc(artist.id).set({
        ...artist,
        createdAt: Timestamp.now()
      });
      console.log(`✓ Imported artist: ${artist.name}`);
    }

    console.log('\nImporting labels...');
    for (const label of mockLabels) {
      await db.collection('labels').doc(label.id).set({
        ...label,
        createdAt: Timestamp.now()
      });
      console.log(`✓ Imported label: ${label.name}`);
    }

    console.log('\nImporting releases...');
    for (const release of mockReleases) {
      const { artistRef, labelRef, releaseDate, preorderAt, ...releaseData } = release;

      await db.collection('releases').doc(release.id).set({
        ...releaseData,
        artistRef: db.collection('artists').doc(artistRef),
        labelRef: db.collection('labels').doc(labelRef),
        releaseDate: Timestamp.fromDate(releaseDate),
        ...(preorderAt && { preorderAt: Timestamp.fromDate(preorderAt) }),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log(`✓ Imported release: ${release.title}`);
    }

    console.log('\n✅ Data import completed successfully!');
    console.log(`\nSummary:`);
    console.log(`- Artists: ${mockArtists.length}`);
    console.log(`- Labels: ${mockLabels.length}`);
    console.log(`- Releases: ${mockReleases.length}`);

  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  }
}

importData();
