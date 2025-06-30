import './styles/index.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import ProductPage from './pages/ProductPage';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';

function App() {


  return (
    <div className="min-h-screen bg-zinc-900 text-gray-300">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
    </div>

  );
}

export default App
