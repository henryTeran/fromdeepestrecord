import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import Head from '../seo/Head';

export default function CheckoutSuccess() {
  return (
    <>
      <Head
        title="Order Confirmed - From Deepest Record"
        description="Your order has been confirmed. Thank you for your purchase!"
      />
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <CheckCircle className="w-24 h-24 text-green-500" />
          </div>

          <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-xl text-gray-400 mb-8">
            Thank you for your purchase. Your order has been confirmed and will be processed shortly.
          </p>

          <div className="bg-zinc-800/50 rounded-lg p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">What happens next?</h2>
            <div className="text-left space-y-4 text-gray-300">
              <div className="flex items-start gap-3">
                <span className="text-red-500 font-bold">1.</span>
                <p>You will receive an order confirmation email shortly.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500 font-bold">2.</span>
                <p>We will prepare your order for shipment.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500 font-bold">3.</span>
                <p>You will receive a shipping notification with tracking information.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/account"
              className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              View Order Details
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
