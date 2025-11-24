import { useEffect } from 'react';

/**
 * Composant SEO pour gérer les balises <title> et <meta> sans dépendance externe
 * Compatible React 19 + Vite
 * 
 * @param {Object} props - Props du composant
 * @param {string} props.title - Titre de la page
 * @param {string} props.description - Description de la page
 * @param {string} props.image - URL de l'image (Open Graph/Twitter)
 * @param {string} props.url - URL de la page (optionnel, utilise window.location.href par défaut)
 * @param {string} props.siteName - Nom du site (optionnel, "From Deepest Record" par défaut)
 * @param {string} props.type - Type Open Graph (optionnel, "website" par défaut)
 * @param {string} props.lang - Langue de la page (optionnel, "en" par défaut)
 */
const Head = ({ 
  title, 
  description, 
  image, 
  url, 
  siteName = "From Deepest Record",
  type = "website",
  lang = "en"
}) => {
  useEffect(() => {
    // Fonction helper pour créer ou mettre à jour une balise meta
    const upsertMeta = (name, content, property = false) => {
      if (!content) return;
      
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    const upsertLink = (rel, href, hreflang = null) => {
      if (!href) return;
      
      const selector = hreflang 
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]`;
      let link = document.querySelector(selector);
      
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        if (hreflang) {
          link.setAttribute('hreflang', hreflang);
        }
        document.head.appendChild(link);
      }
      
      link.setAttribute('href', href);
    };

    // Mettre à jour le titre
    if (title) {
      document.title = title;
    }

    // Mettre à jour la langue de la page
    document.documentElement.lang = lang;

    // URL par défaut
    const currentUrl = url || window.location.href;
    const baseUrl = currentUrl.split('?')[0];

    // Balises meta de base
    upsertMeta('description', description);

    // Open Graph
    upsertMeta('og:title', title, true);
    upsertMeta('og:description', description, true);
    upsertMeta('og:image', image, true);
    upsertMeta('og:url', currentUrl, true);
    upsertMeta('og:site_name', siteName, true);
    upsertMeta('og:type', type, true);
    upsertMeta('og:locale', lang === 'fr' ? 'fr_FR' : lang === 'es' ? 'es_ES' : 'en_US', true);

    // Twitter Cards
    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', description);
    upsertMeta('twitter:image', image);

    // Hreflang pour SEO multilingue
    upsertLink('alternate', baseUrl, 'x-default');
    upsertLink('alternate', `${baseUrl}?lang=en`, 'en');
    upsertLink('alternate', `${baseUrl}?lang=fr`, 'fr');
    upsertLink('alternate', `${baseUrl}?lang=es`, 'es');
    upsertLink('canonical', baseUrl);

    // Cleanup function pour éviter les fuites mémoire
    return () => {
      // Optionnel: nettoyer les balises si nécessaire
      // Pour cette implémentation, on laisse les balises en place
    };
  }, [title, description, image, url, siteName, type, lang]);

  // Ce composant ne rend rien dans le DOM
  return null;
};

export default Head;