import React, { createContext, useContext, useState, useEffect } from 'react';
import { transactions as mockTransactions } from '../utilities/transactions';
import { categories as mockCategories } from '../utilities/categories';

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [state, setState] = useState({
    transactions: [],
    categories: [],
    filters: {
      searchTerm: '',
      category: '',
      dateRange: { start: '', end: '' }
    },
    userRole: 'viewer', // 'admin' or 'viewer'
    theme: 'light',
    isLoading: true
  });

  useEffect(() => {
    const loadState = () => {
      try {
        const savedState = localStorage.getItem('finance-state');
        if (savedState) {
          const parsed = JSON.parse(savedState);
          // Force reset if transactions empty/invalid - clear storage
          if (!Array.isArray(parsed.transactions) || parsed.transactions.length === 0) {
            console.log('Empty/corrupted transactions in localStorage. Resetting to mocks.');
            localStorage.removeItem('finance-state');
            return {
              transactions: mockTransactions,
              filters: { searchTerm: '', category: '', dateRange: { start: '', end: '' } },
              userRole: 'viewer',
              theme: 'light'
            };
          }
          return {
            transactions: parsed.transactions,
            filters: parsed.filters || { searchTerm: '', category: '', dateRange: { start: '', end: '' } },
            userRole: parsed.userRole || 'viewer',
            theme: parsed.theme || 'light'
          };
        }
      } catch (error) {
        console.error('Failed to load state from localStorage:', error);
        localStorage.removeItem('finance-state');
      }
      // Default fresh state
      return {
        transactions: mockTransactions,
        filters: { searchTerm: '', category: '', dateRange: { start: '', end: '' } },
        userRole: 'viewer',
        theme: 'light'
      };
    };

    const loadedData = loadState();
    setState({
      transactions: loadedData.transactions,
      categories: mockCategories,
      filters: loadedData.filters,
      userRole: loadedData.userRole,
      theme: loadedData.theme,
      isLoading: false
    });
  }, []);


  // Save full state to localStorage on any state change
  const saveState = () => {
    if (!state.isLoading) {
      try {
        localStorage.setItem('finance-state', JSON.stringify({
          transactions: state.transactions,
          filters: state.filters,
          userRole: state.userRole,
          theme: state.theme
        }));
      } catch (error) {
        console.error('Failed to save state to localStorage:', error);
      }
    }
  };

  useEffect(() => {
    saveState();
  }, [state]);

  const updateFilters = (newFilters) => {
    setState(prevState => ({
      ...prevState,
      filters: { ...prevState.filters, ...newFilters }
    }));
  };

  const setUserRole = (role) => {
    setState(prevState => ({
      ...prevState,
      userRole: role
    }));
  };

  const addTransaction = (transaction) => {
    setState(prevState => ({
      ...prevState,
      transactions: [...prevState.transactions, { ...transaction, id: Date.now() }]
    }));
  };

  const updateTransaction = (id, updatedTransaction) => {
    setState(prevState => ({
      ...prevState,
      transactions: prevState.transactions.map(t => t.id === id ? { ...t, ...updatedTransaction } : t)
    }));
  };

  const deleteTransaction = (id) => {
    setState(prevState => ({
      ...prevState,
      transactions: prevState.transactions.filter(t => t.id !== id)
    }));
  };

  const toggleTheme = () => {
    setState(prevState => {
      const newTheme = prevState.theme === 'dark' ? 'light' : 'dark';
      return {
        ...prevState,
        theme: newTheme
      };
    });
  };

  const value = {
    ...state,
    updateFilters,
    setUserRole,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    toggleTheme
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};