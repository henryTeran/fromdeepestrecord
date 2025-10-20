# Quick Command Reference

## Essential Commands

### First Time Setup

```bash
# 1. Install Firebase (CRITICAL!)
npm install firebase

# 2. Restore Firebase configuration
# See INSTALLATION.md for file restoration steps

# 3. Install function dependencies
cd functions
npm install
cd ..

# 4. Login to Firebase
firebase login

# 5. Initialize Firebase (if needed)
firebase init

# 6. Deploy infrastructure
firebase deploy --only firestore:rules,firestore:indexes

# 7. Import data
cd scripts
npm install firebase-admin
node importData.js
cd ..

# 8. Deploy functions
firebase deploy --only functions
```

### Development

```bash
# Start dev server
npm run dev

# Start Firebase emulators
firebase emulators:start

# Run both (in separate terminals)
npm run dev
firebase emulators:start
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment

```bash
# Deploy everything
firebase deploy

# Deploy specific targets
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### Firestore

```bash
# Check index status
firebase firestore:indexes

# View Firestore data
firebase firestore:get users

# Delete collection (careful!)
firebase firestore:delete --recursive releases
```

### Functions

```bash
# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only createCheckoutSession

# Test functions locally
cd functions
npm run shell
```

### Stripe

```bash
# Listen to webhooks locally
stripe listen --forward-to http://localhost:5001/your-project/us-central1/stripeWebhook

# Trigger test events
stripe trigger checkout.session.completed

# View events
stripe events list
```

### Data Management

```bash
# Import data
cd scripts
node importData.js

# Check Firestore for data
firebase firestore:get releases --limit 10
```

### Troubleshooting

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run build

# Check Firebase project
firebase projects:list
firebase use [project-id]

# View Firebase config
firebase apps:list web

# Update Firestore indexes from errors
# (Copy index creation commands from console errors)
```

### Package Management

```bash
# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Install specific version
npm install firebase@10.8.0

# Audit security
npm audit
npm audit fix
```

## Environment Variables

### Check current environment

```bash
# View environment variables
cat .env
cat functions/.env

# Test environment in app
node -e "console.log(process.env)"
```

### Set Firebase config

```bash
# Get Firebase config from console or use:
firebase apps:sdkconfig web
```

## Useful Aliases (Optional)

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Firebase shortcuts
alias fd='firebase deploy'
alias fl='firebase functions:log'
alias fe='firebase emulators:start'
alias fi='firebase firestore:indexes'

# Project shortcuts
alias dev='npm run dev'
alias build='npm run build'
alias preview='npm run preview'

# Combined commands
alias devall='npm run dev & firebase emulators:start'
```

## Git Workflow

```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "Add Firebase infrastructure"

# Push
git push origin main

# Create branch
git checkout -b feature/cart-sync

# Merge branch
git checkout main
git merge feature/cart-sync
```

## Maintenance

```bash
# Update browserslist database
npx update-browserslist-db@latest

# Clean project
npm run build
rm -rf dist
rm -rf node_modules/.vite

# Reinstall everything
rm -rf node_modules
rm -rf functions/node_modules
npm install
cd functions && npm install && cd ..
```

## Production Checklist

```bash
# 1. Test build
npm run build

# 2. Test preview
npm run preview

# 3. Run security audit
npm audit

# 4. Check Firebase configuration
firebase projects:list
firebase use production

# 5. Deploy Firestore
firebase deploy --only firestore:rules,firestore:indexes

# 6. Deploy functions
firebase deploy --only functions

# 7. Deploy hosting
firebase deploy --only hosting

# 8. Verify deployment
curl https://your-domain.web.app
```

## Help

```bash
# Firebase help
firebase --help
firebase deploy --help

# npm help
npm --help
npm run --help

# Stripe CLI help
stripe --help
stripe listen --help
```

---

**Pro Tip:** Use `&&` to chain commands that should only run if the previous succeeds:

```bash
npm run build && firebase deploy --only hosting
```

Use `;` to run commands regardless of success:

```bash
npm run build; npm run preview
```

Use `&` to run commands in parallel:

```bash
npm run dev & firebase emulators:start
```
