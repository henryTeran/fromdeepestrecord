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
 */
const Head = ({ 
  title, 
  description, 
  image, 
  url, 
  siteName = "From Deepest Record",
  type = "website" 
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

    // Mettre à jour le titre
    if (title) {
      document.title = title;
    }

    // URL par défaut
    const currentUrl = url || window.location.href;

    // Balises meta de base
    upsertMeta('description', description);

    // Open Graph
    upsertMeta('og:title', title, true);
    upsertMeta('og:description', description, true);
    upsertMeta('og:image', image, true);
    upsertMeta('og:url', currentUrl, true);
    upsertMeta('og:site_name', siteName, true);
    upsertMeta('og:type', type, true);

    // Twitter Cards
    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', description);
    upsertMeta('twitter:image', image);

    // Cleanup function pour éviter les fuites mémoire
    return () => {
      // Optionnel: nettoyer les balises si nécessaire
      // Pour cette implémentation, on laisse les balises en place
    };
  }, [title, description, image, url, siteName, type]);

  // Ce composant ne rend rien dans le DOM
  return null;
};

export default Head;