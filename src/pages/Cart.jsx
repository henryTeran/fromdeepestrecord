import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import CategoryNav from '../components/CategoryNav';
import { Footer } from '../components/Footer';
import { useCartStore } from '../store/cartStore';
import { Minus, Plus, Trash2, Loader2, AlertCircle, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Head from '../seo/Head';
import EmptyState from '../components/EmptyState';

const Cart = () => {
  const cart = useCartStore(state => state.cart);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const clearCart = useCartStore(state => state.clearCart);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 75 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const functions = getFunctions();
      const createCheckout = httpsCallable(functions, 'createCheckoutSession');

      const items = cart.map(item => {
        const base = {
          releaseId: item.id,
          sku: item.sku || 'default',
          qty: item.quantity,
          unitPrice: item.price,
          title: item.title,
        };

        // Only include stripePriceId when it's a non-empty string
        if (item.stripePriceId && typeof item.stripePriceId === 'string' && item.stripePriceId.trim() !== '') {
          return { ...base, stripePriceId: item.stripePriceId };
        }

        return base;
      });

      const result = await createCheckout({
        items,
        currency: 'CHF',
        successUrl: `${window.location.origin}/checkout/success`,
        cancelUrl: `${window.location.origin}/checkout/cancel`,
      });

      if (result.data && result.data.url) {
        window.location.href = result.data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to create checkout session. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-300">
      <Head
        title="Shopping Cart | From Deepest Record"
        description="Review your underground metal music selection and proceed to checkout."
      />
      <Header />
      <Navigation />
      <CategoryNav />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Shopping Cart</h1>

        {cart.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            description="Start adding some releases or merch to your collection"
            actionLabel="Browse Releases"
            actionLink="/category/releases"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  {cart.map((item) => {
                    const itemKey = item.sku ? `${item.id}-${item.sku}` : item.id;

                    return (
                      <div key={itemKey} className="flex items-center space-x-4 bg-zinc-900 p-4 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded"
                          loading="lazy"
                        />
                        <div className="flex-1">
                          <Link
                            to={`/product/${item.id}`}
                            className="font-bold text-white hover:text-red-600 transition-colors"
                          >
                            {item.title}
                          </Link>
                          <p className="text-gray-400 text-sm">{item.artist}</p>
                          {item.format && (
                            <p className="text-gray-500 text-xs">{item.format}</p>
                          )}
                          <p className="text-red-600 font-bold">CHF {item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 bg-zinc-800 rounded">
                            <button
                              onClick={() => updateQuantity(item.id, item.sku, Math.max(1, item.quantity - 1))}
                              className="p-2 hover:text-red-600 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.sku, item.quantity + 1)}
                              className="p-2 hover:text-red-600 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id, item.sku)}
                            className="p-2 text-red-600 hover:text-red-700 transition-colors"
                            aria-label="Remove from cart"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-black rounded-lg p-6 sticky top-32">
                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">CHF {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-white">
                      {shipping === 0 ? 'Free' : `CHF ${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {subtotal < 75 && (
                    <p className="text-sm text-yellow-500">
                      Add CHF {(75 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  )}
                  <div className="border-t border-zinc-700 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-red-600">CHF {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-bold mb-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </button>

                <Link
                  to="/category/releases"
                  className="block text-center text-gray-400 hover:text-white transition-colors"
                >
                  Continue Shopping
                </Link>

                <div className="mt-6 pt-6 border-t border-zinc-800 text-xs text-gray-500 space-y-2">
                  <p>✓ Secure payment with Stripe</p>
                  <p>✓ Worldwide shipping</p>
                  <p>✓ 30-day return policy</p>
                </div>
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
