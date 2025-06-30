import { useCartStore } from '../store/cartStore';

const Cart = () => {
  const cart = useCartStore(state => state.cart);
  const removeFromCart = useCartStore(state => state.removeFromCart);

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Mon panier</h1>
      {cart.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        cart.map((item) => (
          <div key={item.id} className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold">{item.title}</p>
              <p className="text-gray-400 text-sm">{item.band}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span>{item.quantity} x ${item.price.toFixed(2)}</span>
              <button onClick={() => removeFromCart(item.id)} className="text-red-500">Supprimer</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Cart;
