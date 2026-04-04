import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Insights from './pages/Insights';
import RoleSwitcher from './components/RoleSwitcher';
import ThemeToggle from './components/ThemeToggle';
import { useFinance } from './contexts/FinanceContext';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const { theme } = useFinance();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="App">
      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 shadow-md animate-fade-in-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex space-x-8">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 hover:scale-105 focus:scale-105 ${
                  currentView === 'dashboard'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('transactions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 hover:scale-105 focus:scale-105 ${
                  currentView === 'transactions'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setCurrentView('insights')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 hover:scale-105 focus:scale-105 ${
                  currentView === 'insights'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                Insights
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <RoleSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="fade-in">
        {currentView === 'dashboard' ? <Dashboard /> :
         currentView === 'transactions' ? <Transactions /> : <Insights />}
      </div>
    </div>
  )
}

export default App