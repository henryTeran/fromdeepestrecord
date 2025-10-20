import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const VariantSelector = ({ formats = [], selectedSku, onSelectVariant }) => {
  const { t } = useLanguage();

  const getBadge = (format) => {
    const isPreorder = format.preorderAt && new Date(format.preorderAt) > new Date();
    const isLowStock = format.stock > 0 && format.stock <= 5;
    const isOutOfStock = format.stock === 0;

    if (isOutOfStock && !isPreorder) {
      return { text: 'Sold Out', className: 'bg-gray-600 text-white' };
    }
    if (isPreorder) {
      return { text: 'Pre-order', className: 'bg-yellow-600 text-white' };
    }
    if (format.exclusive) {
      return { text: 'Exclusive', className: 'bg-purple-600 text-white' };
    }
    if (format.limited) {
      return { text: 'Limited', className: 'bg-orange-600 text-white' };
    }
    if (isLowStock) {
      return { text: `${format.stock} left`, className: 'bg-red-600 text-white' };
    }
    return null;
  };

  if (!formats || formats.length === 0) {
    return (
      <div className="text-gray-400 text-sm">
        No formats available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-white uppercase tracking-wide">
        Select Format
      </h3>

      <div className="space-y-2">
        {formats.map((format) => {
          const badge = getBadge(format);
          const isSelected = selectedSku === format.sku;
          const isDisabled = format.stock === 0 && !format.preorderAt;

          return (
            <button
              key={format.sku}
              onClick={() => !isDisabled && onSelectVariant(format)}
              disabled={isDisabled}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${isSelected
                  ? 'border-red-600 bg-red-600/10'
                  : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">
                      {format.type}
                    </span>

                    {format.variantColor && (
                      <span className="text-xs text-gray-400">
                        ({format.variantColor})
                      </span>
                    )}

                    {badge && (
                      <span className={`text-xs px-2 py-0.5 rounded ${badge.className}`}>
                        {badge.text}
                      </span>
                    )}
                  </div>

                  {format.bundle && (
                    <div className="text-xs text-gray-400 mb-1">
                      Bundle: {format.bundle}
                    </div>
                  )}

                  {format.description && (
                    <div className="text-xs text-gray-400">
                      {format.description}
                    </div>
                  )}

                  {format.preorderAt && new Date(format.preorderAt) > new Date() && (
                    <div className="text-xs text-yellow-500 mt-1">
                      Ships on {new Date(format.preorderAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-red-600">
                    CHF {format.price.toFixed(2)}
                  </div>
                  {format.stock > 0 && format.stock <= 10 && !isDisabled && (
                    <div className="text-xs text-gray-400 mt-1">
                      {format.stock} in stock
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-xs text-gray-500 mt-2">
        <p>✓ Worldwide shipping available</p>
        <p>✓ Secure payment with Stripe</p>
      </div>
    </div>
  );
};

export default VariantSelector;
