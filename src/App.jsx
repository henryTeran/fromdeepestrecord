import './styles/index.css';
import Header from './components/Header';
import Navigation from './components/Navigation';
import CategoryNav from './components/CategoryNav';
import HeroBanner from './components/HeroBanner';

import FeaturedReleases from './components/FeaturedReleases';
import { NewArrivals } from './components/NewArrivals';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';

function App() {


  return (
    <div className="min-h-screen bg-zinc-900 text-gray-300">
      <Header />
      <Navigation />
      <CategoryNav />
      <HeroBanner />
      {/* <MetalMerch /> */}
      <FeaturedReleases />
      <NewArrivals /> 
      <Newsletter />
      <Footer /> 
    </div>
  );
}

export default App
