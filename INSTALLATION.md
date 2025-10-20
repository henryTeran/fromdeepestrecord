# Installation Guide - From Deepest Record

## ⚠️ IMPORTANT: Firebase Installation Required

The project has been configured with Firebase infrastructure, but the Firebase SDK is **NOT yet installed** due to network issues during setup. You **MUST** install Firebase before the application will work with the backend.

## Quick Start

### 1. Install Firebase Dependency

```bash
npm install firebase
```

**This is mandatory!** The application will not function correctly without Firebase installed.

### 2. Restore Firebase Configuration

After installing Firebase, restore the proper Firebase initialization:

Replace the content of `src/lib/firebase.ts` with:

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE,
  messagingSenderId: import.meta.env.VITE_FB_MSG_SENDER,
  appId: import.meta.env.VITE_FB_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 3. Restore Firebase Hooks

The actual Firebase hooks have been renamed with `-firebase` suffix. After installing Firebase:

```bash
# Restore useAuth
mv src/hooks/useAuth-firebase.js src/hooks/useAuth.js

# Restore useFirestore
mv src/hooks/useFirestore-firebase.js src/hooks/useFirestore.js

# Restore useReleases
mv src/hooks/useReleases-firebase.js src/hooks/useReleases.js

# Remove placeholder files
rm src/hooks/useAuth.jsx
```

Or manually replace the placeholder versions with the `-firebase` versions.

### 4. Configure Environment Variables

Update `.env` with your actual Firebase credentials:

```bash
VITE_FB_API_KEY=your_actual_firebase_api_key
VITE_FB_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FB_PROJECT_ID=your_actual_project_id
VITE_FB_STORAGE=your_project.appspot.com
VITE_FB_MSG_SENDER=your_sender_id
VITE_FB_APP_ID=your_app_id
VITE_PUBLIC_STRIPE_PK=pk_test_your_stripe_key
```

Get these from: Firebase Console → Project Settings → Your apps → Web app

### 5. Install Functions Dependencies

```bash
cd functions
npm install
cd ..
```

### 6. Deploy Firebase Infrastructure

```bash
# Login to Firebase
firebase login

# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# Wait for indexes to build (check status)
firebase firestore:indexes
```

### 7. Import Data

```bash
# Get your service account key from Firebase Console
# Save as scripts/serviceAccountKey.json

cd scripts
npm install firebase-admin
node importData.js
cd ..
```

### 8. Deploy Functions

```bash
firebase deploy --only functions
```

### 9. Build & Run

```bash
# Development
npm run dev

# Production build
npm run build
npm run preview
```

## What's Included

### ✅ Completed Infrastructure

- **Firebase Configuration**
  - Firestore database schema (artists, labels, releases, users, carts, orders, coupons)
  - Security rules
  - Composite indexes for efficient queries
  - Cloud Functions (Stripe checkout, webhooks, MusicBrainz enrichment)

- **Frontend Components**
  - Authentication system (AuthProvider, useAuth)
  - Firestore data hooks (useFirestore, useReleases)
  - New pages: LabelPage, ArtistPage, CheckoutSuccess, CheckoutCancel
  - Updated routing with new paths

- **Backend Functions**
  - `createCheckoutSession` - Stripe payment processing
  - `stripeWebhook` - Order creation and stock management
  - `enrichRelease` - MusicBrainz metadata fetching

- **Data Import Scripts**
  - Mock data for 4 artists, 3 labels, 4 releases
  - Full metadata with formats, pricing, tracks

### 📋 Files Created

```
Firebase Infrastructure:
├── firestore.rules                  # Security rules
├── firestore.indexes.json           # Composite indexes
├── firebase.json                    # Firebase config
├── functions/                       # Cloud Functions
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                        # Stripe secrets
│   └── src/index.ts               # Functions code
└── scripts/
    ├── importData.js               # Data import script
    └── README.md                   # Import instructions

Frontend:
├── src/
│   ├── lib/firebase.ts             # Firebase client (needs restore)
│   ├── hooks/
│   │   ├── useAuth-firebase.js     # Auth hook (needs restore)
│   │   ├── useFirestore-firebase.js # Firestore hooks (needs restore)
│   │   └── useReleases-firebase.js  # Release queries (needs restore)
│   └── pages/
│       ├── LabelPage.jsx
│       ├── ArtistPage.jsx
│       ├── CheckoutSuccess.jsx
│       └── CheckoutCancel.jsx

Documentation:
├── SETUP.md                        # Comprehensive setup guide
└── INSTALLATION.md                 # This file
```

## Troubleshooting

### Firebase Not Installed Error

If you see console warnings about "Firebase not installed":
```bash
npm install firebase
```

Then restore the Firebase configuration files as described above.

### Build Fails

If the build fails after installing Firebase:
```bash
# Clear cache and rebuild
rm -rf node_modules/.vite
npm run build
```

### Firestore Permission Denied

Ensure you've deployed the security rules:
```bash
firebase deploy --only firestore:rules
```

### Functions Not Working

Check that functions are deployed and environment variables are set:
```bash
firebase deploy --only functions
# Check functions/.env has STRIPE_SK and STRIPE_WEBHOOK_SECRET
```

## Next Steps

After completing installation:

1. **Test the catalog** - Run the app and verify the catalog loads (will be empty until data is imported)
2. **Import data** - Follow step 7 to populate the database
3. **Configure Stripe** - Add real Stripe products/prices and update release formats with `stripePriceId`
4. **Update existing pages** - Integrate Firebase into CategoryPage, ProductPage, Cart, Account
5. **Enhance features** - Add filters, variants selector, cart persistence, etc.

## Support & Documentation

- **Detailed Setup**: See `SETUP.md` for comprehensive configuration guide
- **Firebase Docs**: https://firebase.google.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **MusicBrainz API**: https://musicbrainz.org/doc/MusicBrainz_API

## Summary

The Firebase e-commerce infrastructure is **ready but requires Firebase SDK installation**. Once installed and configured:

- ✅ Backend infrastructure complete
- ✅ Cloud Functions deployed
- ✅ Security rules configured
- ✅ New pages created (Label, Artist, Checkout)
- ⏳ Existing pages need Firebase integration
- ⏳ Stripe products/prices need configuration
- ⏳ Data needs to be imported

**Estimated time to complete setup: 30-60 minutes**
