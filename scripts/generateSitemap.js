import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { writeFileSync } from 'fs';
import { join } from 'path';
import process from 'process';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const BASE_URL = 'https://deepestrecords.web.app';

async function generateSitemap() {
  const urls = [];

  // Static pages
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/category/releases', priority: '0.9', changefreq: 'daily' },
    { loc: '/category/vinyl', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/cds', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/tapes', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/merchandise', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/preorders', priority: '0.8', changefreq: 'daily' },
    { loc: '/category/exclusives', priority: '0.8', changefreq: 'weekly' },
    { loc: '/category/contact', priority: '0.7', changefreq: 'monthly' },
    { loc: '/cart', priority: '0.6', changefreq: 'daily' },
    { loc: '/wishlist', priority: '0.6', changefreq: 'daily' },
    { loc: '/account', priority: '0.5', changefreq: 'weekly' },
  ];

  staticPages.forEach(page => {
    const url = [
      '  <url>',
      `    <loc>${BASE_URL}${page.loc}</loc>`,
      `    <changefreq>${page.changefreq}</changefreq>`,
      `    <priority>${page.priority}</priority>`,
      '  </url>'
    ].join('\n');
    urls.push(url);
  });

  // Dynamic pages - Releases
  try {
    const releasesSnapshot = await getDocs(collection(db, 'releases'));
    releasesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.slug) {
        const url = [
          '  <url>',
          `    <loc>${BASE_URL}/product/${data.slug}</loc>`,
          '    <changefreq>weekly</changefreq>',
          '    <priority>0.7</priority>',
          '  </url>'
        ].join('\n');
        urls.push(url);
      }
    });

    // Artists
    const artistsSnapshot = await getDocs(collection(db, 'artists'));
    artistsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.slug) {
        const url = [
          '  <url>',
          `    <loc>${BASE_URL}/artist/${data.slug}</loc>`,
          '    <changefreq>monthly</changefreq>',
          '    <priority>0.6</priority>',
          '  </url>'
        ].join('\n');
        urls.push(url);
      }
    });

    // Labels
    const labelsSnapshot = await getDocs(collection(db, 'labels'));
    labelsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.slug) {
        const url = [
          '  <url>',
          `    <loc>${BASE_URL}/label/${data.slug}</loc>`,
          '    <changefreq>monthly</changefreq>',
          '    <priority>0.6</priority>',
          '  </url>'
        ].join('\n');
        urls.push(url);
      }
    });
  } catch (error) {
    console.error('Error fetching data from Firestore:', error);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  const outputPath = join(process.cwd(), 'public', 'sitemap.xml');
  writeFileSync(outputPath, sitemap);
  console.log(`✅ Sitemap generated successfully at ${outputPath}`);
  console.log(`📊 Total URLs: ${urls.length}`);
  process.exit(0);
}

generateSitemap().catch(error => {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
});
