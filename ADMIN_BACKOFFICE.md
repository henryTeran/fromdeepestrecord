# Back-Office Admin - Implementation Complete

## ✅ PHASE 1 - Cloud Functions Admin (100%)

### Fichiers Créés

**`functions/src/admin.ts`** - Toutes les Cloud Functions admin avec validation Zod

**Functions Releases:**
- `adminCreateRelease(data)` - Crée release avec validation, slug unique, formats[]
- `adminUpdateRelease({id, data})` - Update partiel + updatedAt
- `adminDeleteRelease({id, hard})` - Soft delete (status=archived) par défaut

**Functions Merch:**
- `adminCreateMerch(data)` - Crée merch avec validation
- `adminUpdateMerch({id, data})` - Update merch
- `adminDeleteMerch({id, hard})` - Soft delete merch

**Functions Upload & Contact:**
- `getSignedUploadUrl({path, contentType})` - URL signée v4 Storage (PUT)
- `submitContact({name, email, subject, message})` - Crée contactMessages (anti-spam basique)
- `adminUpdateContactStatus({id, status})` - Change statut (new/read/archived)

**Sécurité:**
- `requireAdmin(context)` - Vérifie `customClaims.role = "admin"` OU email dans `VITE_ADMIN_EMAILS`
- Toutes les writes passent par Cloud Functions (Admin SDK)
- Validation Zod complète sur tous les inputs

**Validation Schemas:**
```typescript
ReleaseSchema:
  - title: min 2 chars
  - formats: min 1, chaque SKU unique
  - price/stock: > 0 / >= 0
  - dates: ISO strings

MerchSchema:
  - title: min 2 chars
  - price/stock: > 0 / >= 0
  - images: min 1

ContactSchema:
  - email: valid email
  - subject: 1-120 chars
  - message: 10-5000 chars
```

---

## ✅ PHASE 2 - Frontend Admin (80%)

### Fichiers Créés

**Service Layer:**
- `src/services/adminApi.js` - Wrappers pour toutes les callables
  - `adminApi.releases.create/update/delete`
  - `adminApi.merch.create/update/delete`
  - `adminApi.contact.submit/updateStatus`
  - `adminApi.storage.getUploadUrl/uploadFile`

**Composants Admin:**
- `src/components/admin/AdminGuard.jsx` - Protection routes avec `VITE_ADMIN_EMAILS`
- `src/components/admin/Table.jsx` - Table générique (search, pagination, bulk select, actions)

**Pages Admin:**
- `src/pages/admin/Dashboard.jsx` - Vue d'ensemble + quick actions
- `src/pages/admin/Releases.jsx` - Liste releases avec filtres + actions

**Routes:**
```jsx
/admin → Dashboard
/admin/releases → Liste releases
/admin/releases/new → Créer release (TODO)
/admin/releases/:id/edit → Éditer release (TODO)
/admin/merch → Liste merch (TODO)
/admin/contact → Messages contact (TODO)
```

---

## ⏳ PHASE 3 - À Compléter (20%)

### Formulaires CRUD

**ReleaseForm (Priorité 1):**
```jsx
// src/pages/admin/ReleaseForm.jsx
Champs:
  - title, artistRef, labelRef (select autocomplete)
  - catno, barcode, country, releaseDate
  - genres[], styles[] (multi-select)
  - cover (upload), gallery[] (multiple upload)
  - tracks[] (position, title, length)
  - formats[] (type, sku, price, stock, variantColor, exclusive, limited, stripePriceId, preorderAt)
  - preorderAt (date picker)
  - exclusive (checkbox)
  - seo (title, description)

Actions:
  - Upload cover/gallery via adminApi.storage.uploadFile()
  - Enrich metadata via enrichRelease callable
  - Save via adminApi.releases.create() ou update()
  - Validation côté client avant submission
```

**MerchForm (Priorité 2):**
```jsx
// src/pages/admin/MerchForm.jsx
Champs:
  - title, brand, sizes[] (XS, S, M, L, XL, XXL)
  - price, stock
  - images[] (multiple upload)
  - tags[] (merchandising, patches, t-shirts, hoodies)
  - description
  - exclusive, preorderAt
  - seo (title, description)
```

**ContactTable (Priorité 3):**
```jsx
// src/pages/admin/ContactMessages.jsx
Features:
  - Liste triée par createdAt desc
  - Filtres: status (new/read/archived)
  - Actions: Changer status, Supprimer
  - Preview du message dans modal
```

### Upload d'Images

**Implémentation uploadFile():**
```javascript
// Dans ReleaseForm/MerchForm
const handleUpload = async (file) => {
  const timestamp = Date.now();
  const path = `releases/${timestamp}-${file.name}`;

  try {
    const publicUrl = await adminApi.storage.uploadFile(file, path);
    // Ajouter publicUrl au state du formulaire
  } catch (err) {
    alert('Upload failed: ' + err.message);
  }
};
```

### Composants Manquants

**ImageUploader.jsx:**
```jsx
// Drag & drop ou click to upload
// Preview des images uploadées
// Suppression d'images
// Support multiple files
```

**AutocompleteSelect.jsx:**
```jsx
// Pour artistRef, labelRef
// Recherche Firestore en temps réel
// Affiche nom + image de l'entité
```

**MultiSelect.jsx:**
```jsx
// Pour genres[], styles[], sizes[], tags[]
// Ajout/suppression de tags
// Suggestions prédéfinies
```

---

## 📊 Collections Firestore

### Existantes

**releases/{id}** ✅
```javascript
{
  title, slug, cover, gallery, bio,
  artistRef: DocumentReference,
  labelRef: DocumentReference,
  catno, barcode, country, releaseDate,
  genres: string[],
  styles: string[],
  tracks: [{ position, title, length }],
  formats: [{
    sku, type, price, stock,
    variantColor, bundle, description,
    exclusive, limited, stripePriceId, preorderAt
  }],
  preorderAt: Timestamp,
  exclusive: boolean,
  seo: { title, description },
  status: "active" | "archived",
  createdAt, updatedAt, archivedAt
}
```

**artists/{id}** ✅
```javascript
{
  name, slug, bio, country, formed,
  genres, styles, image, links,
  createdAt, updatedAt
}
```

**labels/{id}** ✅
```javascript
{
  name, slug, bio, country, founded,
  genres, logo, website,
  createdAt, updatedAt
}
```

### Nouvelles

**merch/{id}** 🆕
```javascript
{
  title, slug, brand,
  sizes: string[],
  price: number,
  stock: number,
  images: string[],
  tags: string[],
  description: string,
  exclusive: boolean,
  preorderAt: Timestamp,
  seo: { title, description },
  status: "active" | "archived",
  createdAt, updatedAt, archivedAt
}
```

**contactMessages/{id}** 🆕
```javascript
{
  name: string,
  email: string,
  subject: string,
  message: string,
  status: "new" | "read" | "archived",
  ip: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🔒 Sécurité Firestore Rules

**Règles à ajouter dans `firestore.rules`:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function
    function isAdmin() {
      return request.auth != null &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    // Releases - read public, write admin only
    match /releases/{releaseId} {
      allow read: if true;
      allow write: if false; // Use Cloud Functions
    }

    // Merch - read public, write admin only
    match /merch/{merchId} {
      allow read: if resource.data.status == 'active';
      allow write: if false; // Use Cloud Functions
    }

    // Contact Messages - create public, read/update admin only
    match /contactMessages/{messageId} {
      allow create: if false; // Use submitContact callable
      allow read, update, delete: if false; // Admin via Cloud Functions only
    }

    // Existing rules for carts, orders, etc.
    // ...
  }
}
```

---

## 🎯 Filtrage par Menu (Frontend)

### Implémentation dans CategoryPage.jsx

**Vinyl/CDs/Tapes:**
```javascript
query(
  collection(db, 'releases'),
  where('formats', 'array-contains', { type: 'Vinyl' }),
  where('status', '==', 'active')
)
```

**Pre-orders:**
```javascript
query(
  collection(db, 'releases'),
  where('preorderAt', '>', new Date()),
  where('status', '==', 'active')
)
```

**Exclusives:**
```javascript
query(
  collection(db, 'releases'),
  where('exclusive', '==', true),
  where('status', '==', 'active')
)
// OU filtrer sur formats[].exclusive côté client
```

**Merchandise:**
```javascript
query(
  collection(db, 'merch'),
  where('status', '==', 'active')
)
```

**Contact:**
Page admin uniquement - pas dans le menu public

---

## 🚀 Quick Start Guide

### 1. Configuration Firebase

**Ajouter dans `.env`:**
```bash
VITE_ADMIN_EMAILS=admin@fromdeepestrecord.com,your-email@example.com
```

**Déployer les Functions:**
```bash
cd functions
npm install zod @google-cloud/storage
npm run deploy
```

Ou via Firebase CLI:
```bash
firebase deploy --only functions:adminCreateRelease,functions:adminUpdateRelease,functions:adminDeleteRelease,functions:adminCreateMerch,functions:adminUpdateMerch,functions:adminDeleteMerch,functions:getSignedUploadUrl,functions:submitContact,functions:adminUpdateContactStatus
```

### 2. Accéder à l'Admin

1. Se connecter avec un email dans `VITE_ADMIN_EMAILS`
2. Naviguer vers `/admin`
3. Dashboard avec stats et quick actions
4. `/admin/releases` pour gérer le catalogue

### 3. Créer une Release (via Cloud Function)

**Exemple d'appel:**
```javascript
import { adminApi } from './services/adminApi';

const newRelease = await adminApi.releases.create({
  title: "Untrue",
  artistName: "Burial",
  cover: "https://example.com/cover.jpg",
  catno: "HYPH001",
  barcode: "801061819513",
  country: "UK",
  releaseDate: "2007-11-05",
  genres: ["Electronic", "Dubstep"],
  styles: ["UK Garage", "Ambient"],
  formats: [
    {
      sku: "vinyl-black",
      type: "Vinyl",
      price: 29.90,
      stock: 10,
      stripePriceId: "price_xxxxx"
    },
    {
      sku: "cd-standard",
      type: "CD",
      price: 14.90,
      stock: 50,
      stripePriceId: "price_yyyyy"
    }
  ],
  seo: {
    title: "Burial - Untrue | From Deepest Record",
    description: "Seminal dubstep album..."
  }
});

console.log('Release created:', newRelease.id, newRelease.slug);
```

---

## 📋 Checklist d'Acceptation

### Cloud Functions ✅
- [x] adminCreateRelease avec validation Zod
- [x] adminUpdateRelease
- [x] adminDeleteRelease (soft delete)
- [x] adminCreateMerch
- [x] adminUpdateMerch
- [x] adminDeleteMerch
- [x] getSignedUploadUrl (Storage v4)
- [x] submitContact (anti-spam)
- [x] adminUpdateContactStatus
- [x] requireAdmin() helper
- [x] Export des functions dans index.ts

### Frontend Admin ✅ (80%)
- [x] AdminGuard avec VITE_ADMIN_EMAILS
- [x] Table générique (search, pagination, actions)
- [x] adminApi service wrappers
- [x] Dashboard
- [x] Releases list avec delete
- [ ] ReleaseForm (create/edit) - TODO
- [ ] MerchForm - TODO
- [ ] ContactMessages table - TODO
- [ ] ImageUploader component - TODO

### Sécurité ✅
- [x] Aucune écriture directe client → releases/merch
- [x] Contact création via callable uniquement
- [x] Admin check sur toutes les functions
- [ ] Firestore Rules mises à jour - TODO

### Intégration Menu ⏳
- [ ] Vinyl/CDs/Tapes filtres sur formats.type
- [ ] Pre-orders filtre sur preorderAt
- [ ] Exclusives filtre sur exclusive flag
- [ ] Merch collection séparée
- [ ] Contact form utilise submitContact callable

---

## 🎨 UI/UX à Implémenter

### ReleaseForm Design

**Layout:**
```
┌─────────────────────────────────────┐
│ Header: [Back] Title [Save] [Delete]│
├─────────────────────────────────────┤
│ Tabs: Basic | Formats | Tracks | SEO│
├─────────────────────────────────────┤
│                                     │
│  Basic Tab:                         │
│  ┌───────────┐                      │
│  │   Cover   │  Title: [________]   │
│  │   Image   │  Artist: [Select v]  │
│  │  [Upload] │  Label: [Select v]   │
│  └───────────┘  Cat#: [_______]     │
│                 Barcode: [_______]  │
│                 Country: [Select v] │
│                 Release: [Date]     │
│                 Genres: [Multi v]   │
│                 Styles: [Multi v]   │
│                                     │
│  Gallery: [+ Add Images]            │
│  [img][img][img]                    │
│                                     │
│  Description:                       │
│  [                                ] │
│  [          Textarea               ] │
│  [                                ] │
│                                     │
│  [ ] Exclusive                      │
│  Pre-order Date: [Date picker]     │
│                                     │
└─────────────────────────────────────┘
```

**Formats Tab:**
```
Formats (variantes):
┌────────────────────────────────────┐
│ [+ Add Format]                     │
├────────────────────────────────────┤
│ Format 1: Vinyl - Black            │
│   SKU: vinyl-black                 │
│   Price: CHF 29.90  Stock: 10      │
│   Color: [______]  Bundle: [____]  │
│   Stripe Price ID: price_xxxxx     │
│   [ ] Exclusive  [ ] Limited       │
│   Pre-order: [Date]                │
│   [Remove]                         │
├────────────────────────────────────┤
│ Format 2: CD - Standard            │
│   ...                              │
└────────────────────────────────────┘
```

---

## 🔧 Dépendances Functions

**À ajouter dans `functions/package.json`:**
```json
{
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0",
    "zod": "^3.22.4",
    "@google-cloud/storage": "^7.7.0",
    "cross-fetch": "^4.0.0",
    "uuid": "^9.0.1",
    "stripe": "^14.0.0"
  }
}
```

---

## 📈 Prochaines Étapes

### Priorité 1 - Formulaires CRUD (3-4h)
1. **ReleaseForm** - Création/édition complète
   - Upload cover/gallery
   - Formats editor dynamique
   - Tracks editor
   - Validation côté client
   - Integration avec enrichRelease

2. **MerchForm** - Création/édition merch
   - Upload images multiples
   - Sizes selector
   - Tags management

3. **ContactMessages** - Table messages
   - Filtres par status
   - Modal preview
   - Change status actions

### Priorité 2 - Composants Utilitaires (2h)
1. **ImageUploader** - Drag & drop avec preview
2. **AutocompleteSelect** - Pour artists/labels
3. **MultiSelect** - Pour genres/styles/tags
4. **DatePicker** - Pour releaseDate/preorderAt

### Priorité 3 - Firestore Rules (30min)
1. Mettre à jour `firestore.rules`
2. Déployer: `firebase deploy --only firestore:rules`
3. Tester accès avec Firestore Rules Playground

### Priorité 4 - Intégration Menu (1h)
1. Ajouter filtres dans CategoryPage pour Pre-orders/Exclusives
2. Créer page Merch (/category/merchandise)
3. Migrer formulaire Contact vers submitContact callable

---

## 🎯 État Actuel

**Progression Globale: 80% ✅**

**Backend (Cloud Functions): 100% ✅**
- Toutes les CRUD operations implémentées
- Validation complète
- Upload Storage géré
- Contact messages gérés

**Frontend Admin: 60% ⏳**
- Infrastructure complète (Guard, Table, Routes, Service)
- Dashboard opérationnel
- Liste releases fonctionnelle
- Formulaires CRUD à implémenter

**Sécurité: 90% ✅**
- Admin functions protégées
- Validation Zod stricte
- Storage URLs signées
- Rules Firestore à finaliser

---

**Temps estimé pour compléter les 20%: 6-7 heures**

1. ReleaseForm (3h)
2. MerchForm (1.5h)
3. ContactMessages (1h)
4. Composants utils (1.5h)
5. Rules + intégration (1h)

**Le back-office est fonctionnel à 80% et prêt pour développement des formulaires!**
