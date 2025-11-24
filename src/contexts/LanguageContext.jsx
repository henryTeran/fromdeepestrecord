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
    tapes: "Tapes",
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
    about: 'About From Deepest Records',
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
    heroTitle: 'THE UNDERGROUND RESISTANCE',
    heroSubtitle: 'Discover the darkest sounds from the underground',
    shopNow: 'Shop Now',
    // Cart
    shoppingCart: 'Shopping Cart',
    yourCartIsEmpty: 'Your cart is empty',
    cartEmptyDesc: 'Start adding some releases or merch to your collection',
    browseReleases: 'Browse Releases',
    items: 'Items',
    clearCart: 'Clear Cart',
    continueShopping: 'Continue Shopping',
    checkout: 'Checkout',
    // Wishlist
    myWishlist: 'My Wishlist',
    yourWishlistIsEmpty: 'Your wishlist is empty',
    wishlistEmptyDesc: 'Start adding your favorite releases to your wishlist',
    browseCatalog: 'Browse Catalog',
    view: 'View',
    remove: 'Remove',
    // Category/Search
    noReleasesFound: 'No releases found',
    noReleasesDesc: 'Try adjusting your filters or browse all releases',
    clearAllFilters: 'Clear all filters',
    loadMore: 'Load More',
    loading: 'Loading...',
    // Toast notifications
    addedToCart: 'Added to cart',
    removedFromCart: 'Removed from cart',
    addedToWishlist: 'Added to wishlist',
    removedFromWishlist: 'Removed from wishlist',
  },
  es: {
    newReleases: 'Nuevos Lanzamientos Cada Viernes a las 12:00 PM PST',
    search: 'Buscar productos...',
    cart: 'Carrito',
    News: 'Noticias',
    vinyl: 'Vinilo',
    cds: 'CDs',
    tapes: "Casete",
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
    about: 'Sobre From Deepest Records',
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
    heroTitle: 'LA RESISTENCIA UNDERGROUND',
    heroSubtitle: 'Descubre los sonidos más oscuros del underground',
    shopNow: 'Comprar Ahora',
    // Cart
    shoppingCart: 'Carrito de Compras',
    yourCartIsEmpty: 'Tu carrito está vacío',
    cartEmptyDesc: 'Comienza a agregar lanzamientos o mercancía a tu colección',
    browseReleases: 'Ver Lanzamientos',
    items: 'Artículos',
    clearCart: 'Vaciar Carrito',
    continueShopping: 'Seguir Comprando',
    checkout: 'Pagar',
    // Wishlist
    myWishlist: 'Mi Lista de Deseos',
    yourWishlistIsEmpty: 'Tu lista de deseos está vacía',
    wishlistEmptyDesc: 'Comienza a agregar tus lanzamientos favoritos a tu lista',
    browseCatalog: 'Ver Catálogo',
    view: 'Ver',
    remove: 'Eliminar',
    // Category/Search
    noReleasesFound: 'No se encontraron lanzamientos',
    noReleasesDesc: 'Intenta ajustar tus filtros o navega todos los lanzamientos',
    clearAllFilters: 'Limpiar todos los filtros',
    loadMore: 'Cargar Más',
    loading: 'Cargando...',
    // Toast notifications
    addedToCart: 'Agregado al carrito',
    removedFromCart: 'Eliminado del carrito',
    addedToWishlist: 'Agregado a lista de deseos',
    removedFromWishlist: 'Eliminado de lista de deseos',
  },
  fr: {
    newReleases: 'Nouvelles Sorties Chaque Vendredi à 12h00 PST',
    search: 'Rechercher des produits...',
    cart: 'Panier',
    News: 'Actualités',
    vinyl: 'Vinyle',
    cds: 'CDs',
    tapes: "Cassettes",
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
    about: 'À propos de From Deepest Records',
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
    heroTitle: 'LA RESISTANCE UNDERGROUND',
    heroSubtitle: 'Découvrez les sons les plus sombres du underground',
    shopNow: 'Acheter Maintenant',
    // Cart
    shoppingCart: 'Panier',
    yourCartIsEmpty: 'Votre panier est vide',
    cartEmptyDesc: 'Commencez à ajouter des sorties ou du merch à votre collection',
    browseReleases: 'Parcourir les Sorties',
    items: 'Articles',
    clearCart: 'Vider le Panier',
    continueShopping: 'Continuer les Achats',
    checkout: 'Passer la Commande',
    // Wishlist
    myWishlist: 'Mes Favoris',
    yourWishlistIsEmpty: 'Votre liste de souhaits est vide',
    wishlistEmptyDesc: 'Commencez à ajouter vos sorties favorites à votre liste',
    browseCatalog: 'Parcourir le Catalogue',
    view: 'Voir',
    remove: 'Retirer',
    // Category/Search
    noReleasesFound: 'Aucune sortie trouvée',
    noReleasesDesc: 'Essayez d\'ajuster vos filtres ou parcourez toutes les sorties',
    clearAllFilters: 'Effacer tous les filtres',
    loadMore: 'Charger Plus',
    loading: 'Chargement...',
    // Toast notifications
    addedToCart: 'Ajouté au panier',
    removedFromCart: 'Retiré du panier',
    addedToWishlist: 'Ajouté aux favoris',
    removedFromWishlist: 'Retiré des favoris',
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