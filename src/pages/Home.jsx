import Navigation from "../components/Navigation";
import Header from "../components/Header";
import CategoryNav from "../components/CategoryNav";
import HeroBanner from "../components/HeroBanner";
import FeaturedReleases from "../components/FeaturedReleases";
import { NewArrivals } from "../components/NewArrivals";
import { Footer } from "../components/Footer";
import Head from "../seo/Head";

const Home = () => {
  return (
    <div className="min-h-screen bg-zinc-900 text-gray-300">
      <Head
        title="From Deepest Record — Underground Metal Music"
        description="Découvrez les sons les plus sombres du underground. Vinyles, CDs, cassettes et merchandise de metal extrême depuis 1998."
        image="/og-cover.jpg"
      />
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