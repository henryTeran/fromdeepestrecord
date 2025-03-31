import { useLanguage } from "../contexts/LanguageContext";

 export const Newsletter = () => {
    const { t } = useLanguage();

    return (
    <div className="bg-grey py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('newsletter')}</h2>
            <p className="text-gray-400 mb-6">{t('newsletterDesc')}</p>
            <div className="flex max-w-md mx-auto">
                <input 
                type="email" 
                placeholder={t('enterEmail')}
                className="flex-1 bg-black text-gray-300 px-4 py-2 rounded-l focus:outline-none focus:ring-1 focus:ring-red-600"
                />
                <button className="bg-red-600 text-white px-6 py-2 rounded-r hover:bg-red-700 transition-colors">
                {t('subscribe')}
                </button>
            </div>
        </div>

    </div>
    );
};
