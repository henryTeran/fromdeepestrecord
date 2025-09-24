import Header from '../components/Header';
import Navigation from '../components/Navigation';
import CategoryNav from '../components/CategoryNav';
import { Footer } from '../components/Footer';
import { useCartStore } from '../store/cartStore';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const cart = useCartStore(state => state.cart);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const clearCart = useCartStore(state => state.clearCart);

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 75 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-300">
      <Header />
      <Navigation />
      <CategoryNav />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Shopping Cart</h1>
        
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400 mb-6">Your cart is empty</p>
            <Link 
              to="/category/releases" 
              className="inline-block bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-black rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Items ({cart.length})</h2>
                  <button 
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 transition-colors text-sm"
                  >
                    Clear Cart
                  </button>
                </div>
                
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 bg-zinc-900 p-4 rounded-lg">
                      <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded" />
                      <div className="flex-1">
                        <Link to={`/product/${item.id}`} className="font-bold text-white hover:text-red-600 transition-colors">
                          {item.title}
                        </Link>
                        <p className="text-gray-400 text-sm">{item.band}</p>
                        <p className="text-red-600 font-bold">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-zinc-800 rounded">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-2 hover:text-red-600 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:text-red-600 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-black rounded-lg p-6 sticky top-32">
                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-white">
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {subtotal < 75 && (
                    <p className="text-sm text-yellow-500">
                      Add ${(75 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  )}
                  <div className="border-t border-zinc-700 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-red-600">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <button className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-bold mb-4">
                  Proceed to Checkout
                </button>
                
                <Link 
                  to="/category/releases" 
                  className="block text-center text-gray-400 hover:text-white transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
