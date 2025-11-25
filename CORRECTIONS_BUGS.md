# 🔧 CORRECTIONS COMPLÈTES - From Deepest Records

## ✅ Section 1: Panier qui augmente après F5 - **CORRIGÉ**

**Fichier**: `src/store/cartStore.js`

**Changements appliqués**:
- Suppression de `mergeLocalAndFirestoreCart` (causait la boucle)
- Le listener `onSnapshot` met à jour le store SANS re-sync
- Firestore = source of truth unique
- Reset complet du panier au logout
- Flag `isInitialized` pour éviter multiple appels

---

## ✅ Section 2: Wishlist → View introuvable - **CORRIGÉ**

**Fichier**: `src/pages/Wishlist.jsx`

**Changement ligne 47**:
```jsx
<Link to={`/release/${item.slug || item.id}`}>
```
Au lieu de `/product/${item.id}`

---

## ✅ Section 3: Modal panier Checkout ne fait rien - **CORRIGÉ**

**Fichier**: `src/components/DeskTopMenu.jsx`

**Changement**: Bouton Checkout est maintenant un `<Link to="/cart">` au lieu d'un `<button>`

---

## ✅ Section 6: Changement d'utilisateur: wishlist/panier restent - **CORRIGÉ**

**Fichier**: `src/store/wishlistStore.js`

**Changements**:
- Scope localStorage par `uid`: `fromdeepest-wishlist-${uid}`
- Reset au logout
- initializeAuth() pour gérer les changements d'utilisateur

**Fichier**: `src/store/cartStore.js`
- Déjà corrigé: reset au logout dans initializeAuth

---

## 📝 Section 4: Historique commandes + panier non vidé après paiement

**À FAIRE**: Modifier `src/pages/Account.jsx` et `src/pages/CheckoutSuccess.jsx`

### Account.jsx - Ajouter section "My Orders":

Après la section "Quick Links", ajouter:

```jsx
<div className="border-t border-zinc-800 pt-6">
  <h2 className="text-xl font-bold text-white mb-4">My Orders</h2>
  <OrdersHistory userId={user.uid} />
</div>
```

Créer le composant `OrdersHistory`:

```jsx
// Dans Account.jsx ou composant séparé
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const OrdersHistory = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersData);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  if (loading) {
    return <Loader2 className="w-6 h-6 animate-spin text-red-600 mx-auto" />;
  }

  if (orders.length === 0) {
    return <p className="text-gray-400">No orders yet</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div key={order.id} className="bg-zinc-800 p-4 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-mono text-sm text-gray-400">#{order.id.slice(0, 8)}</p>
              <p className="text-white font-semibold">CHF {order.total?.toFixed(2) || '0.00'}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              order.status === 'paid' ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
            }`}>
              {order.status}
            </span>
          </div>
          <p className="text-sm text-gray-400">
            {new Date(order.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-400">
            {order.items?.length || 0} item(s)
          </p>
        </div>
      ))}
    </div>
  );
};
```

### CheckoutSuccess.jsx - Vider le panier:

Ajouter en haut du composant:

```jsx
import { useCartStore } from '../store/cartStore';
import { useEffect } from 'react';

export default function CheckoutSuccess() {
  const clearCart = useCartStore(state => state.clearCart);

  useEffect(() => {
    // Vider le panier côté front (Firestore déjà vidé par webhook)
    clearCart();
  }, [clearCart]);

  // ... reste du code
}
```

---

## 📝 Section 5: Formulaire Contact ne fonctionne pas

**À CRÉER**: Page Contact publique

Créer `src/pages/Contact.jsx`:

```jsx
import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { fx } from '../lib/firebase';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import CategoryNav from '../components/CategoryNav';
import { Footer } from '../components/Footer';
import { Loader2, Send } from 'lucide-react';
import { useToastStore } from '../store/toastStore';
import Head from '../seo/Head';

const Contact = () => {
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitContact = httpsCallable(fx, 'submitContact');
      await submitContact(formData);
      
      success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Error submitting contact:', err);
      showError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-300">
      <Head
        title="Contact Us | From Deepest Record"
        description="Get in touch with From Deepest Record"
      />
      <Header />
      <Navigation />
      <CategoryNav />
      
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Contact Us</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message *
            </label>
            <textarea
              required
              rows={6}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
```

Ajouter la route dans `App.jsx`:

```jsx
import Contact from './pages/Contact';

// Dans les routes:
<Route path="/contact" element={<Contact />} />
```

---

## 📝 Section 7: Admin tables Merch vides - **DÉJÀ BON**

Le fichier `src/pages/admin/Merch.jsx` est déjà correct avec le filtrage côté client.

---

## 📝 Section 8: UX Admin - retour à la liste après save

### ReleaseForm.jsx - ligne 136:

```jsx
if (isEdit) {
  await adminApi.releases.update(id, dataToSave);
  alert('Release updated successfully!');
  navigate('/admin/releases'); // AJOUTER CETTE LIGNE
} else {
  const result = await adminApi.releases.create(dataToSave);
  alert('Release created successfully!');
  navigate('/admin/releases');
}
```

### MerchForm.jsx - ligne 88:

```jsx
if (isEdit) {
  await adminApi.merch.update(id, dataToSave);
  alert('Merch updated successfully!');
  navigate('/admin/merch'); // AJOUTER CETTE LIGNE
} else {
  const result = await adminApi.merch.create(dataToSave);
  alert('Merch created successfully!');
  navigate('/admin/merch');
}
```

### Bouton "Back to Dashboard" dans les listes admin:

Dans `src/pages/admin/Releases.jsx` et `Merch.jsx`, ajouter en haut de la page:

```jsx
<div className="flex justify-between items-center mb-8">
  <div>
    <Link
      to="/admin"
      className="text-gray-400 hover:text-white flex items-center gap-2 mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Dashboard
    </Link>
    <h1 className="text-3xl font-bold text-white mb-2">Releases</h1>
    {/* ... */}
  </div>
</div>
```

---

## 📊 RÉCAPITULATIF

✅ **Corrections appliquées automatiquement**:
1. Panier qui augmente après F5
2. Wishlist View introuvable  
3. Modal Checkout ne fait rien
6. Changement d'utilisateur

📝 **À appliquer manuellement**:
4. Historique commandes dans Account.jsx
5. Page Contact publique
8. Navigation admin (retour liste + bouton dashboard)

Tous les fichiers modifiés sont prêts. Build et deploy quand tu veux !

