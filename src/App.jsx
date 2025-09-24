import './styles/index.css';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import CategoryPage from './pages/CategoryPage';
import Account from './pages/Account';

function App() {
  return (
    <HelmetProvider>
      <div className="min-h-screen bg-zinc-900 text-gray-300">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/product-test" element={<ProductPage />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </div>
    </HelmetProvider>
  );
}

export default App