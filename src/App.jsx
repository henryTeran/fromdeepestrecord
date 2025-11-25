import './styles/index.css';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ToastContainer from './components/ToastContainer';
import { useEffect, lazy, Suspense } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

// Lazy loading des pages pour code splitting
const Home = lazy(() => import('./pages/Home'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const Cart = lazy(() => import('./pages/Cart'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const Account = lazy(() => import('./pages/Account'));
const LabelPage = lazy(() => import('./pages/LabelPage'));
const ArtistPage = lazy(() => import('./pages/ArtistPage'));
const Contact = lazy(() => import('./pages/Contact'));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'));
const CheckoutCancel = lazy(() => import('./pages/CheckoutCancel'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminReleases = lazy(() => import('./pages/admin/Releases'));
const AdminMerch = lazy(() => import('./pages/admin/Merch'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const ReleaseForm = lazy(() => import('./pages/admin/ReleaseForm'));
const MerchForm = lazy(() => import('./pages/admin/MerchForm'));
const ContactMessages = lazy(() => import('./pages/admin/ContactMessages'));
import AdminGuard from './components/admin/AdminGuard';

// Composant de fallback pour le chargement
const PageLoader = () => (
  <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-red-600" />
  </div>
);

function App() {
  const { language } = useLanguage();

  useEffect(() => {
    // Update HTML lang attribute when language changes
    document.documentElement.lang = language;
  }, [language]);

  return (
    <AuthProvider>
      <ToastContainer />
      <div className="min-h-screen bg-zinc-900 text-gray-300">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/releases" element={<CategoryPage />} />
            <Route path="/release/:slug" element={<ProductPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/product-test" element={<ProductPage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/label/:slug" element={<LabelPage />} />
            <Route path="/artist/:slug" element={<ArtistPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/account" element={<Account />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/cancel" element={<CheckoutCancel />} />

            <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/admin/releases" element={<AdminGuard><AdminReleases /></AdminGuard>} />
            <Route path="/admin/releases/new" element={<AdminGuard><ReleaseForm /></AdminGuard>} />
            <Route path="/admin/releases/:id/edit" element={<AdminGuard><ReleaseForm /></AdminGuard>} />
            <Route path="/admin/merch" element={<AdminGuard><AdminMerch /></AdminGuard>} />
            <Route path="/admin/merch/new" element={<AdminGuard><MerchForm /></AdminGuard>} />
            <Route path="/admin/merch/:id/edit" element={<AdminGuard><MerchForm /></AdminGuard>} />
            <Route path="/admin/orders" element={<AdminGuard><AdminOrders /></AdminGuard>} />
            <Route path="/admin/contact" element={<AdminGuard><ContactMessages /></AdminGuard>} />
          </Routes>
        </Suspense>
      </div>
    </AuthProvider>
  );
}

export default App