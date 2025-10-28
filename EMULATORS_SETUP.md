# Configuration des Émulateurs Firebase

Ce document explique comment utiliser les émulateurs Firebase en développement pour le projet FromDeepestRecord.

## Configuration

Le projet est maintenant configuré pour utiliser les émulateurs Firebase en mode développement (`import.meta.env.DEV === true`).

### Ports des émulateurs

- **Functions**: http://127.0.0.1:5001/deepestrecords/us-central1
- **Firestore**: 127.0.0.1:8080
- **Storage**: 127.0.0.1:9199
- **Auth**: http://127.0.0.1:9099
- **UI Emulators**: http://127.0.0.1:4000

## Démarrage

### 1. Lancer les émulateurs

Dans un terminal, exécutez :

```bash
npm run emulators
```

Ou manuellement :

```bash
cd functions
npm run build
cd ..
firebase emulators:start --only functions,firestore,storage,auth
```

### 2. Lancer le front-end

Dans un autre terminal :

```bash
npm run dev
```

## Configuration des variables d'environnement

### Functions (functions/.env)

Créez ou modifiez le fichier `functions/.env` :

```env
STRIPE_SK=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
FIREBASE_STORAGE_BUCKET=deepestrecords.appspot.com
GCLOUD_PROJECT=deepestrecords
VITE_ADMIN_EMAILS=votre-email@example.com
```

### Front-end (.env)

Le fichier `.env` à la racine du projet devrait contenir :

```env
VITE_API_KEY=dev-api-key
VITE_APP_ID=dev-app-id
```

## Architecture

### Connexion automatique aux émulateurs

Le fichier `src/lib/firebase.ts` détecte automatiquement l'environnement de développement et connecte tous les services Firebase aux émulateurs locaux.

### API unifiée

Le fichier `src/services/adminApi.js` utilise maintenant une base URL qui change automatiquement selon l'environnement :

- **Dev**: http://127.0.0.1:5001/deepestrecords/us-central1
- **Prod**: https://us-central1-deepestrecords.cloudfunctions.net

### CORS

Toutes les fonctions HTTP utilisent le module `functions/src/cors.ts` pour gérer les requêtes CORS de manière universelle.

## Test de l'admin Merch

1. Accédez à http://localhost:5173/admin/merch/new
2. Remplissez le formulaire :
   - Title: Supayniyux
   - Brand: From Deepest Record
   - Price: 29.90
   - Stock: 50
   - Sizes: S, M, L, XL
   - Tags: black, logo, limited, supayniyux
   - Description: (libre)
3. Uploadez une image
4. Cliquez sur "Create Merch"

### Vérifications

- Les requêtes réseau doivent pointer vers `http://127.0.0.1:5001/`
- Pas d'erreurs CORS (OPTIONS doit retourner 204)
- L'UI des émulateurs (http://127.0.0.1:4000) doit montrer la nouvelle entrée dans la collection "merch"

## Dépannage

### Erreur de connexion aux émulateurs

Si le front-end ne peut pas se connecter aux émulateurs, vérifiez que :

1. Les émulateurs sont bien lancés
2. Les ports ne sont pas déjà utilisés
3. Le mode développement est bien actif (`import.meta.env.DEV === true`)

### Erreur CORS

Si vous rencontrez des erreurs CORS :

1. Vérifiez que toutes les fonctions utilisent `applyCors(req, res)`
2. Redémarrez les émulateurs
3. Videz le cache du navigateur

### Storage upload échoue

Si l'upload d'images échoue :

1. Vérifiez que l'émulateur Storage est bien lancé sur le port 9199
2. Vérifiez les logs des émulateurs pour plus de détails
