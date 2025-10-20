# From Deepest Record - Firebase Setup Guide

## Prerequisites

- Node.js 20+
- npm or yarn
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project (create at https://console.firebase.google.com)
- A Stripe account (https://stripe.com)

## Initial Setup

### 1. Install Dependencies

```bash
# Frontend dependencies
npm install

# Functions dependencies
cd functions
npm install
cd ..
```

### 2. Firebase Configuration

#### A. Initialize Firebase (if not already done)

```bash
firebase login
firebase init
```

Select:
- Firestore (with rules and indexes)
- Functions (TypeScript, Node 20)
- Hosting

#### B. Configure Environment Variables

**Frontend (.env):**

```bash
VITE_FB_API_KEY=your_firebase_api_key
VITE_FB_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FB_PROJECT_ID=your_project_id
VITE_FB_STORAGE=your_project.appspot.com
VITE_FB_MSG_SENDER=your_sender_id
VITE_FB_APP_ID=your_app_id
VITE_PUBLIC_STRIPE_PK=pk_test_your_stripe_publishable_key
```

Get these values from Firebase Console → Project Settings → Your apps → Web app

**Functions (functions/.env):**

```bash
STRIPE_SK=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 3. Deploy Firestore Rules & Indexes

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

Wait for indexes to build (can take several minutes). Check status:
```bash
firebase firestore:indexes
```

### 4. Import Initial Data

**A. Get Service Account Key**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `scripts/serviceAccountKey.json`

**B. Run Import Script**
```bash
cd scripts
npm install firebase-admin
node importData.js
```

This imports:
- 4 artists
- 3 labels
- 4 releases with full metadata

### 5. Configure Stripe

#### A. Create Products & Prices

For each format in your releases, create products in Stripe Dashboard:
- Go to Products → Add Product
- Create prices for each format variant
- Copy the `price_xxx` IDs

#### B. Update Release Formats

Update the `stripePriceId` field in your releases with actual Stripe price IDs.

#### C. Setup Webhook

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Forward events to local function:
   ```bash
   stripe listen --forward-to http://localhost:5001/your-project/us-central1/stripeWebhook
   ```
3. Copy the webhook signing secret to `functions/.env`

For production:
1. Deploy functions: `firebase deploy --only functions`
2. Add webhook endpoint in Stripe Dashboard:
   - URL: `https://us-central1-your-project.cloudfunctions.net/stripeWebhook`
   - Events: `checkout.session.completed`

### 6. Deploy Functions

```bash
firebase deploy --only functions
```

This deploys:
- `createCheckoutSession` - Creates Stripe checkout sessions
- `stripeWebhook` - Handles payment confirmations
- `enrichRelease` - Fetches metadata from MusicBrainz

### 7. Deploy Hosting

```bash
npm run build
firebase deploy --only hosting
```

## Development

### Run Locally

**Frontend:**
```bash
npm run dev
```

**Firebase Emulators:**
```bash
firebase emulators:start
```

Update `src/lib/firebase.ts` to connect to emulators in development:

```typescript
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

## Architecture Overview

### Frontend (React + Vite)

```
src/
├── lib/
│   └── firebase.ts          # Firebase client config
├── hooks/
│   ├── useAuth.js           # Authentication hook
│   ├── useFirestore.js      # Generic Firestore hooks
│   └── useReleases.js       # Release-specific queries
├── pages/
│   ├── Home.jsx
│   ├── CategoryPage.jsx     # Catalog with filters/pagination
│   ├── ProductPage.jsx      # Release details with variants
│   ├── LabelPage.jsx        # Label profile + releases
│   ├── ArtistPage.jsx       # Artist profile + discography
│   ├── Cart.jsx
│   ├── Account.jsx
│   └── Checkout*.jsx        # Success/Cancel pages
└── store/
    ├── cartStore.js         # Zustand cart (syncs with Firestore)
    └── wishlistStore.js     # Zustand wishlist
```

### Backend (Firebase)

```
Firestore Collections:
├── artists/{id}
├── labels/{id}
├── releases/{id}
├── users/{uid}
├── carts/{uid}
├── orders/{id}
└── coupons/{code}

Cloud Functions:
├── createCheckoutSession    # Callable function
├── stripeWebhook           # HTTP endpoint
└── enrichRelease           # Callable function
```

## Key Features

### 1. Catalog Filtering & Pagination

`CategoryPage` supports:
- Format filters (Vinyl, CD, Cassette)
- Label/Artist filters
- Genre filters
- Price range
- In stock / Pre-order
- Sorting (newest, oldest, price)
- Firestore cursor-based pagination

### 2. Release Variants

`ProductPage` displays:
- Multiple formats (Vinyl colors, CD, Cassette)
- Format-specific pricing & stock
- Badges (Pre-order, Exclusive, Limited, Low stock)
- Tabs (Description, Tracklist, Details, Shipping)
- Artist/Label links

### 3. Persistent Cart

- Zustand for UI state
- Syncs with Firestore `carts/{uid}`
- Anonymous carts supported
- Merges on login

### 4. Stripe Checkout

Flow:
1. User clicks "Checkout" → Calls `createCheckoutSession`
2. Redirects to Stripe Checkout
3. On success → Webhook creates order, decrements stock
4. Redirects to `/checkout/success`

### 5. MusicBrainz Enrichment

Admin function to fetch:
- Cover art from Cover Art Archive
- Track listings with durations
- Release metadata
- Stored in Firestore

## Security

### Firestore Rules

- Public read for catalog (artists, labels, releases)
- Authenticated write for user data (carts, addresses)
- Orders created only via Cloud Functions
- Users can only read their own orders

### Authentication

- Email/password via Firebase Auth
- No magic links or social auth (as specified)
- Email verification disabled by default

## Troubleshooting

### "Network error" during npm install

If you encounter network issues:
```bash
npm install --legacy-peer-deps
# or
npm install --force
```

### Firestore indexes not ready

Wait for indexes to build:
```bash
firebase firestore:indexes
```

Or manually create via error messages in console.

### Stripe webhook signature fails

Ensure `STRIPE_WEBHOOK_SECRET` matches:
- Local: From `stripe listen` output
- Production: From Stripe Dashboard webhook settings

### Functions deployment fails

Check Node version:
```bash
node --version  # Should be 20+
```

Rebuild functions:
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

## Production Checklist

- [ ] Update all environment variables
- [ ] Configure proper Stripe products/prices
- [ ] Deploy Firestore rules & indexes
- [ ] Import production data
- [ ] Deploy functions
- [ ] Configure Stripe webhook (production URL)
- [ ] Build & deploy hosting
- [ ] Test complete checkout flow
- [ ] Setup SendGrid/email service for order confirmations
- [ ] Configure custom domain
- [ ] Enable Firebase Analytics
- [ ] Setup monitoring & alerts

## Next Steps

1. **Enhance CategoryPage** with full filter UI
2. **Update ProductPage** with variants selector and tabs
3. **Integrate Stripe** checkout in Cart page
4. **Add SEO** enhancements (Schema.org, sitemap)
5. **Implement i18n** for multi-language support
6. **Optimize images** (WebP/AVIF, lazy loading)
7. **Add admin panel** for managing releases

## Support

For issues or questions:
- Firebase Docs: https://firebase.google.com/docs
- Stripe Docs: https://stripe.com/docs
- MusicBrainz API: https://musicbrainz.org/doc/MusicBrainz_API
