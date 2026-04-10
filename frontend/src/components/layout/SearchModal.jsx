import { useState, useMemo } from 'react';
import { Search, X, TrendingUp, TrendingDown, Calendar, DollarSign, FileText } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { Overlay } from '../ui';

const SearchModal = ({ isOpen, onClose, transactions = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { formatCurrency } = useCurrency();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    return transactions.filter(tx => 
      tx.category?.toLowerCase().includes(query) ||
      tx.type?.toLowerCase().includes(query) ||
      tx.notes?.toLowerCase().includes(query) ||
      tx.amount?.toString().includes(query)
    ).slice(0, 10); // Limit to 10 results
  }, [searchQuery, transactions]);

  if (!isOpen) return null;

  const getCategoryIcon = (type) => {
    return type === 'income' ? (
      <TrendingUp className="w-4 h-4 text-success-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-danger-600" />
    );
  };

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      containerClassName="items-start justify-center pt-20 px-4"
      backdropClassName="bg-black/30 backdrop-blur-sm"
      panelClassName="max-w-2xl"
      ariaLabelledBy="search-modal-title"
    >
      <div className="relative w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        <h2 id="search-modal-title" className="sr-only">Search transactions</h2>
        {/* Search Input */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions, categories, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-lg outline-none placeholder-gray-400 dark:placeholder-gray-500 dark:text-gray-100"
              autoFocus
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {!searchQuery.trim() ? (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">
                Start typing to search transactions
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Search by category, type, amount, or notes
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">
                No transactions found
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Try adjusting your search query
              </p>
            </div>
          ) : (
            <div className="p-2">
              {searchResults.map((tx) => (
                <div
                  key={tx._id}
                  className="p-4 hover:bg-gray-50 dark:bg-gray-700 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-gray-100 group-hover:bg-white dark:bg-gray-800 rounded-lg transition-colors">
                        {getCategoryIcon(tx.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {tx.category}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            tx.type === 'income' 
                              ? 'bg-success-100 text-success-700' 
                              : 'bg-danger-100 text-danger-700'
                          }`}>
                            {tx.type}
                          </span>
                        </div>
                        {tx.notes && (
                          <p className="text-sm text-gray-500 truncate">
                            {tx.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(tx.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-lg font-semibold ${
                        tx.type === 'income' ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {searchResults.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <p className="text-xs text-gray-500 text-center">
              Showing {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
            </p>
          </div>
        )}
      </div>
    </Overlay>
  );
};

export default SearchModal;
