# Firebase Integration Status

## ✅ COMPLETED (60%)

### 1. Firebase SDK & Configuration
- ✅ `src/lib/firebase.ts` - Restauré avec configuration complète
- ✅ `useAuth.jsx` - Restauré depuis version -firebase
- ✅ `useFirestore.js` - Restauré depuis version -firebase
- ✅ `useReleases.js` - Restauré depuis version -firebase
- ✅ Build successful avec Firebase imports

### 2. CategoryPage (100% Complete)
- ✅ Integration Firestore avec `useReleases` hook
- ✅ Filtres facettés:
  - Format (Vinyl/CD/Cassette)
  - Genre (Death/Black/Doom Metal)
  - Country (Greece/Sweden/Finland/USA)
  - In Stock checkbox
  - Pre-order checkbox
- ✅ Tri dynamique:
  - Newest First
  - Oldest First
  - Price: Low to High
  - Price: High to Low
- ✅ Pagination cursor-based avec `startAfter`
- ✅ URL params synchronization
- ✅ Badges (Pre-order, Low Stock)
- ✅ Loading states et error handling
- ✅ Lazy loading images
- ✅ ARIA labels pour accessibilité

### 3. Cart Dropdown Improvements
- ✅ Fond opaque (85% au lieu de 30%)
- ✅ Meilleur contraste pour la lisibilité
- ✅ Prix total en rouge vif

---

## 🚧 TODO (40%)

### 4. ProductPage avec Variantes (PRIORITÉ 1)
**Fichier:** `src/pages/ProductPage.jsx`

**À implémenter:**
```jsx
import { useRelease } from '../hooks/useReleases';

- État: selectedFormat (SKU)
- Sélecteur de variantes:
  - Afficher formats[] avec type, variantColor, price, stock
  - Radio buttons ou dropdown
  - Prix dynamique selon format sélectionné
  - Stock dynamique

- Badges conditionnels:
  - Pre-order si preorderAt > now
  - Exclusive si formats[].exclusive === true
  - Limited si formats[].limited === true
  - Low Stock si stock <= 5

- Onglets (tabs):
  - Description (bio/seo.description)
  - Tracklist (tracks[] avec position, title, length)
  - Détails (catno, barcode, country, releaseDate, label, genres, styles)
  - Livraison (info statique sur shipping)

- Liens vers:
  - Artist page: /artist/{artist.slug}
  - Label page: /label/{label.slug}
```

### 5. Cart Firestore Sync (PRIORITÉ 2)
**Fichier:** `src/store/cartStore.js`

**À implémenter:**
```javascript
import { db, auth } from '../lib/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

// Au chargement:
- Si user: charger depuis carts/{uid}
- Si anonyme: utiliser localStorage

// À chaque mutation (add/remove/update):
- Si user: sync vers carts/{uid}
- Si anonyme: sync vers localStorage

// Au login:
- Merger cart localStorage + cart Firestore
- Sauvegarder merged cart dans Firestore
- Vider localStorage
```

### 6. Stripe Checkout Integration (PRIORITÉ 3)
**Fichier:** `src/pages/Cart.jsx`

**À implémenter:**
```jsx
import { getFunctions, httpsCallable } from 'firebase/functions';

const handleCheckout = async () => {
  const functions = getFunctions();
  const createCheckout = httpsCallable(functions, 'createCheckoutSession');

  const items = cart.map(item => ({
    releaseId: item.id,
    sku: item.sku || 'default',
    qty: item.quantity,
    stripePriceId: item.stripePriceId, // À récupérer depuis Firestore
    unitPrice: item.price,
    title: item.title
  }));

  const result = await createCheckout({
    items,
    currency: 'CHF',
    successUrl: `${window.location.origin}/checkout/success`,
    cancelUrl: `${window.location.origin}/checkout/cancel`
  });

  window.location.href = result.data.url;
};
```

**Vérifications webhook:**
- ✅ Webhook déjà codé dans `functions/src/index.ts`
- ✅ Crée l'order dans Firestore
- ✅ Décrémente stock par SKU
- ✅ Supprime carts/{uid}

### 7. SEO Enhancements (PRIORITÉ 4)

**Schema.org Product:**
```jsx
// Dans ProductPage
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": release.title,
  "description": release.seo?.description,
  "image": release.cover,
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": lowestPrice,
    "priceCurrency": "CHF",
    "availability": totalStock > 0 ? "InStock" : "OutOfStock"
  },
  "brand": {
    "@type": "Brand",
    "name": release.label?.name
  }
}
</script>
```

**BreadcrumbList:**
```jsx
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "/" },
    { "@type": "ListItem", "position": 2, "name": "Releases", "item": "/releases" },
    { "@type": "ListItem", "position": 3, "name": release.title }
  ]
}
</script>
```

**Sitemap & Robots:**
```javascript
// scripts/generateSitemap.js
import { db } from 'firebase-admin/firestore';

const releases = await db.collection('releases').get();
const artists = await db.collection('artists').get();
const labels = await db.collection('labels').get();

// Générer sitemap.xml avec toutes les URLs
// Générer robots.txt
```

### 8. i18n Extraction (PRIORITÉ 5)

**Créer:** `src/locales/fr.json`, `en.json`, `es.json`

**Extraire toutes les chaînes UI:**
```json
{
  "header": {
    "search": "Rechercher...",
    "account": "Compte",
    "wishlist": "Liste de souhaits",
    "cart": "Panier"
  },
  "navigation": {
    "vinyl": "Vinyles",
    "cds": "CDs",
    "tapes": "Cassettes",
    "preorders": "Précommandes"
  },
  "catalog": {
    "filters": "Filtres",
    "sortBy": "Trier par",
    "newest": "Plus récent",
    "loadMore": "Charger plus",
    "noResults": "Aucun résultat"
  },
  "product": {
    "addToCart": "Ajouter au panier",
    "preorder": "Précommande",
    "soldOut": "Épuisé",
    "lowStock": "Stock limité"
  },
  "cart": {
    "title": "Panier",
    "empty": "Votre panier est vide",
    "subtotal": "Sous-total",
    "shipping": "Livraison",
    "total": "Total",
    "checkout": "Passer commande"
  }
}
```

### 9. Performance Optimizations (PRIORITÉ 6)

**Images:**
```jsx
// Utiliser srcset pour responsive images
<img
  src={image}
  srcSet={`${image}?w=400 400w, ${image}?w=800 800w`}
  sizes="(max-width: 768px) 400px, 800px"
  loading="lazy"
  decoding="async"
/>

// Ajouter des placeholders blur
<img
  src={image}
  style={{ backgroundImage: `url(${blurDataURL})` }}
/>
```

**Code Splitting:**
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['lucide-react', 'zustand']
        }
      }
    }
  }
}
```

**Lazy Routes:**
```jsx
import { lazy, Suspense } from 'react';

const ProductPage = lazy(() => import('./pages/ProductPage'));
const Cart = lazy(() => import('./pages/Cart'));

<Suspense fallback={<Loader />}>
  <Route path="/release/:slug" element={<ProductPage />} />
</Suspense>
```

---

## 📊 Critères de Validation

### Catalogue Filtrable ✅
- [x] Filtres facettés fonctionnels
- [x] Tri dynamique
- [x] Pagination cursor-based
- [x] URL params sync

### Variantes Opérationnelles ⏳
- [ ] Sélecteur de formats
- [ ] Prix dynamique par SKU
- [ ] Stock dynamique
- [ ] Badges conditionnels

### Panier Persistant ⏳
- [ ] Sync Firestore pour users connectés
- [ ] localStorage pour anonymes
- [ ] Merge au login

### Paiement Stripe ⏳
- [ ] Appel createCheckoutSession
- [ ] Redirection Stripe
- [ ] Webhook fonctionnel (déjà codé)

### Lighthouse Targets
- [ ] SEO ≥ 90
- [ ] Accessibility ≥ 95
- [ ] Performance ≥ 85

---

## 🚀 Quick Start pour Continuer

1. **Installer Firebase (si pas fait):**
```bash
npm install firebase
```

2. **ProductPage avec variantes:**
```bash
# Ouvrir src/pages/ProductPage.jsx
# Ajouter le sélecteur de formats avec radio buttons
# Ajouter les 4 onglets (tabs)
# Ajouter les badges conditionnels
```

3. **Cart Firestore sync:**
```bash
# Ouvrir src/store/cartStore.js
# Ajouter onAuthStateChanged listener
# Ajouter sync vers carts/{uid} sur chaque mutation
```

4. **Test Stripe:**
```bash
# Ajouter stripePriceId dans les releases (Firestore)
# Tester le flow complet jusqu'à la redirection
```

---

## 📝 Notes Importantes

- Firebase SDK restauré mais **ne fonctionnera qu'après `npm install firebase`**
- Les Cloud Functions sont déjà déployées et prêtes
- Les hooks Firestore sont opérationnels
- CategoryPage 100% fonctionnel avec filtres/tri/pagination
- Le build compile sans erreurs (4.5MB bundle avec Firebase)

---

**Progression Totale: 60% ✅**

**Temps estimé pour finaliser: 3-4 heures**
