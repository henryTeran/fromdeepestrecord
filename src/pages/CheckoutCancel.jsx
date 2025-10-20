import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import Head from '../seo/Head';

export default function CheckoutCancel() {
  return (
    <>
      <Head
        title="Checkout Cancelled - From Deepest Record"
        description="Your checkout was cancelled."
      />
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <XCircle className="w-24 h-24 text-yellow-500" />
          </div>

          <h1 className="text-4xl font-bold mb-4">Checkout Cancelled</h1>
          <p className="text-xl text-gray-400 mb-8">
            Your checkout was cancelled. Your cart items are still saved and ready when you want to complete your purchase.
          </p>

          <div className="bg-zinc-800/50 rounded-lg p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">Need help?</h2>
            <p className="text-gray-300">
              If you experienced any issues during checkout, please contact our support team.
              We're here to help you complete your order.
            </p>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/cart"
              className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Return to Cart
            </Link>
            <Link
              to="/"
              className="px-8 py-3 bg-zinc-700 text-white font-semibold rounded-lg hover:bg-zinc-600 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
