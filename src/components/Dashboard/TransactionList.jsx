import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getRecentTransactions, deleteTransaction } from '../../services/transactionService';
import { getCategoryEmoji } from '../../utils/transactionParser';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Trash2, Calendar, Tag, DollarSign } from 'lucide-react';

const TransactionList = ({ onTransactionChange }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const result = await getRecentTransactions(user.uid, 20);
    if (result.success) {
      setTransactions(result.data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleDeleteTransaction = async (transactionId, transaction) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      const result = await deleteTransaction(user.uid, transactionId, transaction);
      
      if (result.success) {
        // Update local state
        setTransactions(prev => prev.filter(t => t.id !== transactionId));
        
        // The balance is already updated in the service, so we need to refresh from Firebase
        // to get the correct updated balance. Add small delay to ensure Firebase sync
        if (onTransactionChange) {
          setTimeout(() => {
            onTransactionChange();
          }, 100);
        }
      }
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Recent Transactions</h2>
        
        {/* Filter Buttons - Responsive */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              filter === 'income' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              filter === 'expense' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Expenses
          </button>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No transactions found</p>
          <p className="text-sm mt-2">Start by adding your first transaction using the chat!</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Mobile Layout - Stacked */}
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                <div className="text-xl sm:text-2xl flex-shrink-0">
                  {getCategoryEmoji(transaction.category)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
                    {transaction.description}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{formatDate(transaction.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{transaction.category}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount and Actions - Mobile responsive */}
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 mt-2 sm:mt-0">
                <div className="text-left sm:text-right">
                  <p className={`font-semibold text-sm sm:text-base ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {transaction.type}
                  </p>
                </div>
                
                <button
                  onClick={() => handleDeleteTransaction(transaction.id, transaction)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Delete transaction"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;