# From Deepest Record - E-Commerce Platform

A professional React + Vite + Tailwind + Firebase e-commerce platform for a metal/rock music label, inspired by Nuclear Blast and Metal Blade stores.

---

## ⚠️ IMPORTANT: Firebase Installation Required

**The Firebase SDK is NOT yet installed.** Before running the application, you must:

```bash
npm install firebase
```

Then follow the complete setup instructions in **`INSTALLATION.md`**.

---

## Features

### 🎵 Catalog Management
- Multi-format releases (Vinyl, CD, Cassette) with color variants
- Pre-order support with release dates
- Low stock and exclusive badges
- Genre and style tagging
- Label and artist pages

### 🛒 E-Commerce
- Persistent shopping cart (Firestore-synced)
- Wishlist functionality
- Stripe Checkout integration
- Order history and tracking
- Secure payment processing

### 🎨 User Experience
- Modern, responsive design with Tailwind CSS
- Fluid animations and transitions
- Multi-language support (i18n ready)
- SEO optimized with structured data
- Product filtering and sorting

### 🔧 Backend
- Firebase Authentication (email/password)
- Cloud Firestore database
- Cloud Functions for:
  - Stripe checkout sessions
  - Payment webhooks
  - MusicBrainz metadata enrichment
- Production-ready security rules

---

## Quick Start

### 1. Install Dependencies

```bash
# Frontend
npm install

# ⚠️ CRITICAL: Install Firebase
npm install firebase

# Functions
cd functions
npm install
cd ..
```

### 2. Configure Firebase

See **`INSTALLATION.md`** for complete Firebase setup instructions.

Quick summary:
1. Create Firebase project
2. Update `.env` with Firebase credentials
3. Restore Firebase configuration files
4. Deploy Firestore rules and indexes
5. Import initial data
6. Deploy Cloud Functions

### 3. Development

```bash
# Start development server
npm run dev

# Run Firebase emulators (optional)
firebase emulators:start
```

### 4. Build

```bash
npm run build
npm run preview
```

---

## Project Structure

```
from-deepest-record/
├── src/
│   ├── components/          # UI components
│   ├── pages/              # Route pages
│   │   ├── Home.jsx
│   │   ├── CategoryPage.jsx
│   │   ├── ProductPage.jsx
│   │   ├── LabelPage.jsx   # NEW
│   │   ├── ArtistPage.jsx  # NEW
│   │   ├── Cart.jsx
│   │   ├── Wishlist.jsx
│   │   └── Account.jsx
│   ├── hooks/
│   │   ├── useAuth.js      # Firebase Auth
│   │   ├── useFirestore.js # Firestore queries
│   │   └── useReleases.js  # Release queries
│   ├── lib/
│   │   └── firebase.ts     # Firebase config
│   ├── store/              # Zustand state
│   ├── services/           # API services
│   └── seo/               # SEO components
├── functions/              # Cloud Functions
│   └── src/
│       └── index.ts       # Stripe + MusicBrainz
├── scripts/
│   └── importData.js      # Data import script
├── firestore.rules        # Security rules
├── firestore.indexes.json # Composite indexes
└── firebase.json          # Firebase config
```

---

## Documentation

📖 **Comprehensive guides available:**

- **`INSTALLATION.md`** - Quick start installation guide
- **`SETUP.md`** - Complete setup and configuration
- **`FIREBASE_IMPLEMENTATION_SUMMARY.md`** - Technical implementation details
- **`scripts/README.md`** - Data import instructions

---

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite 6** - Build tool
- **Tailwind CSS 3** - Styling
- **React Router 7** - Routing
- **Zustand 5** - State management
- **i18next** - Internationalization
- **Lucide React** - Icons

### Backend
- **Firebase Firestore** - NoSQL database
- **Firebase Auth** - Authentication
- **Cloud Functions** - Serverless backend (Node 20 + TypeScript)
- **Stripe** - Payment processing

### External APIs
- **MusicBrainz** - Music metadata
- **Cover Art Archive** - Album artwork

---

## Environment Variables

### Frontend (`.env`)
```bash
VITE_FB_API_KEY=your_firebase_api_key
VITE_FB_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FB_PROJECT_ID=your_project_id
VITE_FB_STORAGE=your_project.appspot.com
VITE_FB_MSG_SENDER=your_sender_id
VITE_FB_APP_ID=your_app_id
VITE_PUBLIC_STRIPE_PK=pk_test_your_stripe_key
```

### Functions (`functions/.env`)
```bash
STRIPE_SK=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

## Database Schema

### Collections

#### `releases/{id}`
- Title, artist, label references
- Multiple format variants (SKU, type, color, price, stock)
- Tracks with durations
- Cover art and galleries
- Genres, styles, release dates
- Pre-order support
- SEO metadata

#### `artists/{id}`
- Name, country, biography
- Image, slug

#### `labels/{id}`
- Name, country, website
- Logo, slug

#### `users/{uid}`
- Email, name
- Addresses (array)

#### `carts/{uid}`
- Items (release ref, SKU, quantity)
- Updated timestamp

#### `orders/{id}`
- User reference
- Items with pricing
- Payment status (Stripe)
- Shipping details
- Order status

---

## API Reference

### Cloud Functions

#### `createCheckoutSession` (Callable)
Creates Stripe checkout session.

```javascript
const result = await createCheckoutSession({
  items: [
    { releaseId, sku, qty, stripePriceId, unitPrice, title }
  ],
  currency: 'CHF',
  successUrl: 'https://...',
  cancelUrl: 'https://...'
});
// Returns: { id, url }
```

#### `stripeWebhook` (HTTP)
Handles `checkout.session.completed` events.
- Creates order
- Decrements stock
- Clears cart

#### `enrichRelease` (Callable)
Fetches metadata from MusicBrainz.

```javascript
const result = await enrichRelease({
  releaseId,
  artist: 'Band Name',
  title: 'Album Title',
  barcode: '123456789'
});
```

---

## Security

### Firestore Rules

- ✅ Public read for catalog (releases, artists, labels)
- ✅ Authenticated read/write for user data (carts, addresses)
- ✅ Users can only access their own orders
- ✅ Orders created only via Cloud Functions
- ✅ No direct write access to releases/artists/labels

### Authentication

- Email/password authentication
- No email verification by default
- User profiles stored in Firestore
- Address management

---

## Deployment

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

### Cloud Functions

```bash
firebase deploy --only functions
```

### Firestore

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

---

## Development Roadmap

### ✅ Completed
- Firebase infrastructure
- Database schema and security rules
- Cloud Functions (Stripe + MusicBrainz)
- Authentication system
- Label and artist pages
- Checkout flow
- Data import scripts

### 🚧 In Progress
- CategoryPage filters and pagination
- ProductPage variants selector
- Cart Firestore synchronization
- Account page integration

### 📋 Planned
- SEO enhancements (Schema.org, sitemap)
- Admin panel
- Email notifications (SendGrid)
- Image optimization (WebP/AVIF)
- Performance optimization
- Analytics integration

---

## Browser Support

- Chrome 87+
- Firefox 78+
- Safari 14+
- Edge 88+
- Modern mobile browsers

---

## Contributing

This is a private project for From Deepest Record. For support or questions, please contact the development team.

---

## License

Proprietary - All Rights Reserved

---

## Credits

- **Design Inspiration**: Nuclear Blast, Metal Blade
- **Music Metadata**: MusicBrainz, Cover Art Archive
- **Payment Processing**: Stripe
- **Infrastructure**: Firebase by Google

---

**Built with ❤️ for metal music lovers worldwide 🤘**
