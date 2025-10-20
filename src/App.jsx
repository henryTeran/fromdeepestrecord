import './styles/index.css';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';

import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import CategoryPage from './pages/CategoryPage';
import Account from './pages/Account';
import LabelPage from './pages/LabelPage';
import ArtistPage from './pages/ArtistPage';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import AdminDashboard from './pages/admin/Dashboard';
import AdminReleases from './pages/admin/Releases';
import ReleaseForm from './pages/admin/ReleaseForm';
import MerchForm from './pages/admin/MerchForm';
import ContactMessages from './pages/admin/ContactMessages';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-zinc-900 text-gray-300">
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
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/releases" element={<AdminReleases />} />
          <Route path="/admin/releases/new" element={<ReleaseForm />} />
          <Route path="/admin/releases/:id/edit" element={<ReleaseForm />} />
          <Route path="/admin/merch/new" element={<MerchForm />} />
          <Route path="/admin/merch/:id/edit" element={<MerchForm />} />
          <Route path="/admin/contact" element={<ContactMessages />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App