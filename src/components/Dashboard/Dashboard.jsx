import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Wallet, TrendingUp, TrendingDown, DollarSign, RefreshCw, Calendar, PieChart } from 'lucide-react';
import { getUserProfile, getTransactions } from '../../services/transactionService';
import TransactionList from './TransactionList';

const Dashboard = () => {
  const { user, userProfile, setUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    thisMonth: { income: 0, expense: 0 },
    thisWeek: { income: 0, expense: 0 },
    categories: {}
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const refreshData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch updated user profile
      const profileResult = await getUserProfile(user.uid);
      if (profileResult.success) {
        setUserProfile(profileResult.data);
      }

      // Fetch recent transactions for stats
      const transactionsResult = await getTransactions(user.uid, { limit: 100 });
      if (transactionsResult.success) {
        calculateStats(transactionsResult.data);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactionData) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    
    const monthlyStats = { income: 0, expense: 0 };
    const weeklyStats = { income: 0, expense: 0 };
    const categoryStats = {};

    transactionData.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      
      // Category stats
      if (!categoryStats[transaction.category]) {
        categoryStats[transaction.category] = { income: 0, expense: 0 };
      }
      categoryStats[transaction.category][transaction.type] += transaction.amount;
      
      // Monthly stats
      if (transactionDate >= thisMonth) {
        monthlyStats[transaction.type] += transaction.amount;
      }
      
      // Weekly stats
      if (transactionDate >= thisWeek) {
        weeklyStats[transaction.type] += transaction.amount;
      }
    });

    setStats({
      thisMonth: monthlyStats,
      thisWeek: weeklyStats,
      categories: categoryStats
    });
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
              Welcome back, {userProfile?.displayName || 'User'}! 👋
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Here's what's happening with your finances today.
            </p>
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">Sync</span>
          </button>
        </div>

        {/* Balance Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Current Balance */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-blue-100 text-xs sm:text-sm font-medium">Current Balance</p>
                <p className="text-xl sm:text-2xl font-bold truncate">{formatCurrency(userProfile?.balance)}</p>
                <p className="text-blue-200 text-xs mt-1">
                  {userProfile?.balance >= 0 ? 'Positive' : 'Negative'} balance
                </p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Wallet className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>
          </div>

          {/* Total Income */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-green-100 text-xs sm:text-sm font-medium">Total Income</p>
                <p className="text-xl sm:text-2xl font-bold truncate">{formatCurrency(userProfile?.totalIncome)}</p>
                <p className="text-green-200 text-xs mt-1 truncate">
                  This month: {formatCurrency(stats.thisMonth.income)}
                </p>
              </div>
              <div className="bg-green-400 bg-opacity-30 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-red-100 text-xs sm:text-sm font-medium">Total Expenses</p>
                <p className="text-xl sm:text-2xl font-bold truncate">{formatCurrency(userProfile?.totalExpense)}</p>
                <p className="text-red-200 text-xs mt-1 truncate">
                  This month: {formatCurrency(stats.thisMonth.expense)}
                </p>
              </div>
              <div className="bg-red-400 bg-opacity-30 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>
          </div>

          {/* Savings Rate */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-purple-100 text-xs sm:text-sm font-medium">Savings Rate</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {userProfile?.totalIncome > 0 
                    ? Math.round(((userProfile.totalIncome - userProfile.totalExpense) / userProfile.totalIncome) * 100)
                    : 0
                  }%
                </p>
                <p className="text-purple-200 text-xs mt-1">
                  {userProfile?.totalIncome > userProfile?.totalExpense ? 'Great job!' : 'Need improvement'}
                </p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <PieChart className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Stats - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">This Week</h3>
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Income</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(stats.thisWeek.income)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expenses</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(stats.thisWeek.expense)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium text-gray-800">Net</span>
                <span className={`font-bold ${
                  (stats.thisWeek.income - stats.thisWeek.expense) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatCurrency(stats.thisWeek.income - stats.thisWeek.expense)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">This Month</h3>
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Income</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(stats.thisMonth.income)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expenses</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(stats.thisMonth.expense)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium text-gray-800">Net</span>
                <span className={`font-bold ${
                  (stats.thisMonth.income - stats.thisMonth.expense) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatCurrency(stats.thisMonth.income - stats.thisMonth.expense)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction List with refresh callback */}
        <TransactionList onTransactionChange={refreshData} />

        {/* Getting Started - Responsive */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg p-4 sm:p-6 mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">🚀 Get Started</h2>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base">
            Start tracking your finances by chatting with our AI assistant! The enhanced NLP understands complex sentences.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 text-sm">
            <div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">💸 Advanced Expense Examples:</h3>
              <ul className="space-y-1 text-purple-100 text-xs sm:text-sm">
                <li>• "I bought groceries for 500 taka today"</li>
                <li>• "Paid the electricity bill 2000"</li>
                <li>• "Spent 350 on movie tickets last night"</li>
                <li>• "Ordered pizza for 800 BDT"</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">💰 Advanced Income Examples:</h3>
              <ul className="space-y-1 text-purple-100 text-xs sm:text-sm">
                <li>• "Received my monthly salary 50000"</li>
                <li>• "Got paid 3000 for freelance work"</li>
                <li>• "Earned bonus 5000 from company"</li>
                <li>• "Sold my old phone for 15000"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;