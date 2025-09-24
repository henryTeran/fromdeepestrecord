# From Deepest Record - Music Metadata Enrichment

A modern React + Vite + Tailwind application for a metal music label with automatic metadata enrichment.

## Features

- **Automatic Metadata Enrichment**: Fetches cover art, tracklists, and detailed information from MusicBrainz and Cover Art Archive
- **SEO Optimized**: JSON-LD structured data and Open Graph meta tags
- **Modern UI**: Fluid animations, glassmorphism effects, and responsive design
- **E-commerce Ready**: Shopping cart, wishlist, and product pages
- **Multi-language Support**: English, French, Spanish

## Quick Start

1. **Install dependencies**:
```bash
npm install
```

2. **Optional - Add Discogs token** (for enhanced metadata):
Create `.env` in the root directory:
```
VITE_DISCOGS_TOKEN=your_discogs_token_here
```

3. **Start development server**:
```bash
npm run dev
```

4. **View the demo**:
Navigate to `/product-test` to see the metadata enrichment in action.

## Metadata Enrichment

The system automatically enriches product data using:

- **MusicBrainz**: Artist info, release dates, labels, tracklists
- **Cover Art Archive**: High-quality cover images
- **Discogs** (optional): Format details, genres, styles

### API Rate Limits

- MusicBrainz: 1 request per second (built-in delays)
- Discogs: 60 requests per minute with token
- Cover Art Archive: No strict limits

### Fallback Strategy

If enrichment fails, the application gracefully falls back to:
- Original product data
- Placeholder images
- Basic product information

## File Structure

```
src/
├── services/musicMeta.js          # Metadata enrichment service
├── features/catalog/useEnrich.js  # React hook for enrichment
├── seo/ProductSchema.jsx          # SEO and structured data
├── pages/ProductPage.jsx          # Product display page
└── components/                    # UI components
```

## Build for Production

```bash
npm run build
npm run preview
```

## Environment Variables

- `VITE_DISCOGS_TOKEN`: Optional Discogs API token for enhanced metadata

## Browser Support

- Modern browsers with ES2020+ support
- Mobile responsive design
- Progressive enhancement for older browsers