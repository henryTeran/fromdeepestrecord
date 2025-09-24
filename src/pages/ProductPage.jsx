import { useParams } from 'react-router-dom';
import { products } from '../data/products';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import CategoryNav from '../components/CategoryNav';
import { Footer } from '../components/Footer';
import ProductSuggestions from '../components/ProductSuggestions';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { Heart, ShoppingCart, Truck, Shield, RotateCcw } from 'lucide-react';

const ProductPage = () => {
  const { id } = useParams();
  const product = products.find(p => p.id === parseInt(id));
  const addToCart = useCartStore(state => state.addToCart);
  const addToWishlist = useWishlistStore(state => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);
  const isInWishlist = useWishlistStore(state => state.isInWishlist);

  if (!product) return <div className="text-white p-8">Produit introuvable.</div>;

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-300">
      <Header />
      <Navigation />
      <CategoryNav />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-full max-w-md mx-auto rounded-lg shadow-lg" 
            />
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white">{product.title}</h1>
              <h2 className="text-2xl text-gray-400 mb-4">{product.band}</h2>
              <p className="text-3xl font-bold text-red-600 mb-6">${product.price.toFixed(2)}</p>
            </div>
            
            {/* Add to Cart Section */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => addToCart(product)}
                  className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 font-bold"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={() =>
                    isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)
                  }
                  className="bg-zinc-800 text-white py-3 px-6 rounded-lg hover:bg-zinc-700 transition-colors flex items-center justify-center"
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'text-red-600' : ''}`} />
                </button>
              </div>
              
              {/* Product Features */}
              <div className="bg-black p-6 rounded-lg space-y-4">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-red-600" />
                  <span className="text-sm">Free shipping on orders over $75</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-red-600" />
                  <span className="text-sm">Secure payment & buyer protection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <RotateCcw className="w-5 h-5 text-red-600" />
                  <span className="text-sm">30-day return policy</span>
                </div>
              </div>
            </div>
            
            {/* Product Description */}
            <div className="bg-black p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 text-white">Product Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Artist:</span> {product.band}</p>
                <p><span className="text-gray-400">Title:</span> {product.title}</p>
                <p><span className="text-gray-400">Format:</span> CD</p>
                <p><span className="text-gray-400">Genre:</span> Extreme Metal</p>
                <p><span className="text-gray-400">Label:</span> From Deepest Record</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ProductSuggestions currentProductId={product.id} />
      <Footer />
    </div>
  );
};

export default ProductPage;
