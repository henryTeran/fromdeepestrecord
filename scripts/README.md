# Data Import Scripts

## Setup

1. Download your Firebase service account key:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in the `scripts/` directory

2. Install dependencies:
   ```bash
   cd scripts
   npm install firebase-admin
   ```

3. Run the import script:
   ```bash
   node importData.js
   ```

## What Gets Imported

The script imports:
- 4 artists (Necromantic Worship, Morbid Execution, Sacrilegious Torment, Doom Enthroned)
- 3 labels (Iron Bonehead, Osmose, Nuclear War Now!)
- 4 releases with full metadata, formats, tracks, and SEO data

## Security Note

**NEVER commit `serviceAccountKey.json` to version control!**

The `.gitignore` should include:
```
scripts/serviceAccountKey.json
```
