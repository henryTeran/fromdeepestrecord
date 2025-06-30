import Navigation from "../components/Navigation";
import Header from "../components/Header";
import CategoryNav from "../components/CategoryNav";
import HeroBanner from "../components/HeroBanner";
import FeaturedReleases from "../components/FeaturedReleases";
import { NewArrivals } from "../components/NewArrivals";
import { Footer } from "../components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-zinc-900 text-gray-300">
      <Header />
      <Navigation />
      <CategoryNav />
      <HeroBanner />
      {/* <MetalMerch /> */}
      <FeaturedReleases />
      <NewArrivals /> 
      {/* <Newsletter /> */}
      <Footer /> 
    </div>
  );
};

export default Home;