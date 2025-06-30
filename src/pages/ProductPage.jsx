import { useParams } from 'react-router-dom';
import { products } from '../data/products';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import CategoryNav from '../components/CategoryNav';
import { Footer } from '../components/Footer';



const ProductPage = () => {
  const { id } = useParams();
  const product = products.find(p => p.id === parseInt(id));

  if (!product) return <div className="text-white p-8">Produit introuvable.</div>;

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-300">
      <Header />
      <Navigation />
      <CategoryNav />
      <div className="p-8 text-white">
        <img src={product.image} alt={product.title} className="w-64 mb-4" />
        <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
        <h2 className="text-xl text-gray-400 mb-2">{product.band}</h2>
        <p className="text-lg mb-4">${product.price}</p>
        <button className="bg-red-600 text-white px-4 py-2 rounded">Ajouter au panier</button>
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;
