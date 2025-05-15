import React from "react";
import { Heart, Calendar } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";


const newArrivals = [
    {
      id: 1,
      title: "Eternal Crypt of Darkness",
      band: "Morbid Execution",
      price: 12.99,
      image: "https://www.metal-archives.com/images/2/7/9/9/279984.jpg?0436"
    },
    // Ajoute plus d'objets ici si nécessaire
];
export const NewArrivals = () => {
    
    const { t } = useLanguage();
  
    return (
      <section className="bg-black py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 flex items-center border-b border-zinc-700 pb-4">
            <Calendar className="w-6 h-6 mr-2 text-red-600" />
            {t("newArrivals")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newArrivals.map((item) => (
              <div
                key={item.id}
                className="flex space-x-4 bg-zinc-900 p-4 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">{item.band}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-red-600 font-bold">${item.price.toFixed(2)}</span>
                    <div className="flex space-x-2">
                      <button className="p-2 rounded hover:bg-zinc-700 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700 transition-colors">
                        {t("addToCart")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };