import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { DollarSign, Check, ChevronDown, Search } from 'lucide-react';
import useClickOutside from '../hooks/useClickOutside';

const CurrencySelector = ({ variant = 'default', showLabel = true }) => {
  const { currentCurrency, currencies, currency, changeCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectorRef = useRef(null);

  const closeSelector = useCallback(() => {
    setIsOpen(false);
  }, []);

  useClickOutside(selectorRef, closeSelector, isOpen);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeSelector();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeSelector]);

  const filteredCurrencies = Object.values(currencies).filter(curr =>
    curr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    curr.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (code) => {
    changeCurrency(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  if (variant === 'compact') {
    return (
      <div ref={selectorRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-primary-500 transition-all duration-200 text-sm font-medium text-gray-700 hover:text-primary-600"
        >
          <span className="text-lg">{currency.flag}</span>
          <span className="font-semibold">{currency.symbol}</span>
          <span className="text-xs text-gray-500">{currency.code}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-slide-in-down">
              {/* Search */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search currencies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Currency list */}
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {filteredCurrencies.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => handleSelect(curr.code)}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-primary-50 transition-colors ${
                      currentCurrency === curr.code ? 'bg-primary-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{curr.flag}</span>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm">{curr.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-mono font-semibold">{curr.code}</span>
                          <span>·</span>
                          <span>{curr.symbol}</span>
                        </div>
                      </div>
                    </div>
                    {currentCurrency === curr.code && (
                      <Check className="w-5 h-5 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>

              {/* Footer note */}
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  Exchange rates are approximate. All data stored in LKR.
                </p>
              </div>
            </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Currency
        </label>
      )}
      <div ref={selectorRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white border-2 border-gray-200 hover:border-primary-500 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-xl">{currency.flag}</span>
                {currency.name}
              </p>
              <p className="text-xs text-gray-500">{currency.code} ({currency.symbol})</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-slide-in-down">
              {/* Search */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search currencies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Currency list */}
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                {filteredCurrencies.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => handleSelect(curr.code)}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-primary-50 transition-colors ${
                      currentCurrency === curr.code ? 'bg-primary-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{curr.flag}</span>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">{curr.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-mono font-semibold">{curr.code}</span>
                          <span>·</span>
                          <span>{curr.symbol}</span>
                        </div>
                      </div>
                    </div>
                    {currentCurrency === curr.code && (
                      <Check className="w-5 h-5 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>

              {/* Footer note */}
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  Exchange rates are approximate. All data stored in Sri Lankan Rupees (LKR).
                </p>
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CurrencySelector;
