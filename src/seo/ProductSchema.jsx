import { Helmet } from 'react-helmet-async';

/**
 * SEO component for product pages with JSON-LD structured data
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data
 * @returns {JSX.Element} Helmet component with structured data
 */
export default function ProductSchema({ product }) {
  if (!product) return null;

  const {
    id,
    title,
    artist,
    label,
    catno,
    barcode,
    cover,
    description,
    date,
    country,
    format,
    price,
    stock
  } = product;

  // Create structured data for search engines
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${artist} - ${title}`,
    "brand": {
      "@type": "Brand",
      "name": label || "From Deepest Record"
    },
    "sku": catno || id,
    "gtin": barcode || undefined,
    "image": cover || undefined,
    "description": description || `${title} by ${artist}`,
    "releaseDate": date || undefined,
    "category": "Music > Vinyl",
    "offers": {
      "@type": "Offer",
      "price": price || 0,
      "priceCurrency": "CHF",
      "availability": stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "From Deepest Record"
      }
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Artist",
        "value": artist
      },
      country && {
        "@type": "PropertyValue",
        "name": "Country",
        "value": country
      },
      format && {
        "@type": "PropertyValue",
        "name": "Format",
        "value": format
      }
    ].filter(Boolean)
  };

  // Clean up undefined values
  Object.keys(structuredData).forEach(key => {
    if (structuredData[key] === undefined) {
      delete structuredData[key];
    }
  });

  const pageTitle = `${artist} - ${title} | From Deepest Record`;
  const pageDescription = description || `Buy ${title} by ${artist} on From Deepest Record. ${format ? `Available on ${format}.` : ''} Underground metal music.`;

  return (
    <Helmet>
      {/* Page title and meta description */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />

      {/* Open Graph tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content="product" />
      {cover && <meta property="og:image" content={cover} />}
      <meta property="og:site_name" content="From Deepest Record" />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {cover && <meta name="twitter:image" content={cover} />}

      {/* Product specific meta tags */}
      {price && <meta property="product:price:amount" content={price} />}
      <meta property="product:price:currency" content="CHF" />
      {stock !== undefined && (
        <meta property="product:availability" content={stock > 0 ? "in stock" : "out of stock"} />
      )}

      {/* JSON-LD structured data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData, null, 2)}
      </script>
    </Helmet>
  );
}