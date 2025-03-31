import React, { createContext, useContext, useState } from 'react';

const languages = ['en', 'es', 'fr'];

const translations = {
  en: {
    newReleases: 'New Releases Every Friday at 12:00 PM PST',
    search: 'Search products...',
    cart: 'Cart',
    News: 'News',
    vinyl: 'Vinyl',
    cds: 'CDs',
    merchandise: 'Merchandise',
    preorders: 'Pre-orders',
    exclusives: 'Exclusives',
    digital: 'Digital',
    releases: 'Releases',
    featuredReleases: 'Featured Releases',
    newArrivals: 'New Arrivals',
    addToCart: 'Add to Cart',
    newsletter: 'Subscribe to our Newsletter',
    newsletterDesc: 'Get updates about new releases, restocks, and exclusive offers',
    enterEmail: 'Enter your email',
    subscribe: 'Subscribe',
    about: 'About From Deepest Record',
    aboutDesc: 'The premier underground metal label and distribution since 1998.',
    adress: 'Geneva - Switzerland',
    customerService: 'Customer Service',
    shippingInfo: 'Shipping Info',
    returns: 'Returns',
    privacyPolicy: 'Privacy Policy',
    contact: 'Contact',
    followUs: 'Follow Us',
    account: 'Account',
    wishlist: 'Wishlist',
    heroTitle: 'UNLEASH THE UNDERGROUND',
    heroSubtitle: 'Discover the darkest sounds from the underground',
    shopNow: 'Shop Now',
  },
  es: {
    newReleases: 'Nuevos Lanzamientos Cada Viernes a las 12:00 PM PST',
    search: 'Buscar productos...',
    cart: 'Carrito',
    News: 'Noticias',
    vinyl: 'Vinilo',
    cds: 'CDs',
    merchandise: 'Mercancía',
    preorders: 'Pre-pedidos',
    exclusives: 'Exclusivos',
    digital: 'Digital',
    releases: 'Lanzamientos',
    featuredReleases: 'Lanzamientos Destacados',
    newArrivals: 'Nuevas Llegadas',
    addToCart: 'Añadir al Carrito',
    newsletter: 'Suscríbete a nuestro Boletín',
    newsletterDesc: 'Recibe actualizaciones sobre nuevos lanzamientos, reposiciones y ofertas exclusivas',
    enterEmail: 'Ingresa tu email',
    subscribe: 'Suscribirse',
    about: 'Sobre From Deepest Record',
    aboutDesc: 'El principal sello y distribución de metal underground desde 1998.',
    adress: 'Ginebra - Suiza',
    customerService: 'Servicio al Cliente',
    shippingInfo: 'Información de Envío',
    returns: 'Devoluciones',
    privacyPolicy: 'Política de Privacidad',
    contact: 'Contacto',
    followUs: 'Síguenos',
    account: 'Cuenta',
    wishlist: 'Lista de Deseos',
    heroTitle: 'DESATA EL UNDERGROUND',
    heroSubtitle: 'Descubre los sonidos más oscuros del underground',
    shopNow: 'Comprar Ahora',
  },
  fr: {
    newReleases: 'Nouvelles Sorties Chaque Vendredi à 12h00 PST',
    search: 'Rechercher des produits...',
    cart: 'Panier',
    News: 'Actualités',
    vinyl: 'Vinyle',
    cds: 'CDs',
    merchandise: 'Marchandise',
    preorders: 'Précommandes',
    exclusives: 'Exclusifs',
    digital: 'Numérique',
    releases: 'Sorties',
    featuredReleases: 'Sorties en Vedette',
    newArrivals: 'Nouveautés',
    addToCart: 'Ajouter au Panier',
    newsletter: 'Abonnez-vous à notre Newsletter',
    newsletterDesc: 'Recevez des mises à jour sur les nouvelles sorties, les réapprovisionnements et les offres exclusives',
    enterEmail: 'Entrez votre email',
    subscribe: "S'abonner",
    about: 'À propos de From Deepest Record',
    aboutDesc: "Le premier label et distributeur de metal underground depuis 1998.",
    adress: 'Genève - Suisse',
    customerService: 'Service Client',
    shippingInfo: 'Informations de Livraison',
    returns: 'Retours',
    privacyPolicy: 'Politique de Confidentialité',
    contact: 'Contact',
    followUs: 'Suivez-nous',
    account: 'Compte',
    wishlist: 'Liste de Souhaits',
    heroTitle: 'LIBÉREZ LE UNDERGROUND',
    heroSubtitle: 'Découvrez les sons les plus sombres du underground',
    shopNow: 'Acheter Maintenant',
  },
};




const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};