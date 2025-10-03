import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ChatWidget from './components/Chat/ChatWidget';
import { LogOut } from 'lucide-react';
import { logoutUser } from './services/authService';

const AppContent = () => {
  const { user, userProfile } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation - Responsive */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">💰 Wallet App</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block truncate max-w-32 sm:max-w-none">
                Welcome, {userProfile?.displayName || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Dashboard />
      </main>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
