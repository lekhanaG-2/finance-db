import React, { useState, useMemo, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';

const Transactions = () => {
  const { transactions, categories, filters, updateFilters, userRole, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    category: '',
    amount: '',
    type: 'income'
  });
  const [errors, setErrors] = useState({});

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : id;
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (filters.category) filtered = filtered.filter(t => t.category === filters.category);
    if (filters.dateRange.start) filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.dateRange.start));
    if (filters.dateRange.end) filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.dateRange.end));
    if (localSearchTerm) filtered = filtered.filter(t => t.description.toLowerCase().includes(localSearchTerm.toLowerCase()));
    return filtered;
  }, [transactions, filters, localSearchTerm]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      let aVal = sortField === 'date' ? new Date(a.date) : a.amount;
      let bVal = sortField === 'date' ? new Date(b.date) : b.amount;
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  }, [filteredTransactions, sortField, sortOrder]);

  const handleSort = (field) => {
    setSortField(field);
    setSortOrder(sortField === field && sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = 'Description required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Amount > 0 required';
    if (!formData.category) newErrors.category = 'Category required';
    if (!formData.date) newErrors.date = 'Date required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (userRole !== 'admin') return;
    setEditingTransaction(null);
    setFormData({ date: '', description: '', category: '', amount: '', type: 'income' });
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      amount: Math.abs(transaction.amount).toString(),
      type: transaction.type
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Delete transaction?')) deleteTransaction(id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const amount = formData.type === 'expense' ? -parseFloat(formData.amount) : parseFloat(formData.amount);
    const data = { ...formData, amount: editingTransaction ? amount : amount };
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data);
    } else {
      addTransaction(data);
    }
    setShowModal(false);
    setEditingTransaction(null);
    setFormData({ date: '', description: '', category: '', amount: '', type: 'income' });
  };

  const handleCloseModal = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
      setEditingTransaction(null);
      setErrors({});
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingTransaction(null);
    setErrors({});
    setFormData({ date: '', description: '', category: '', amount: '', type: 'income' });
  };

  const clearFilters = () => {
    setLocalSearchTerm('');
    updateFilters({ category: '', dateRange: { start: '', end: '' } });
  };

  const handleResetData = () => {
    if (confirm('Reset to mock data?')) {
      localStorage.removeItem('finance-state');
      window.location.reload();
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-center dark:text-white">Transactions</h1>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button onClick={handleResetData} className="px-6 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 shadow-lg transition-all">
          🔄 Reset Data
        </button>
        <button onClick={clearFilters} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg transition-all">
          Clear Filters
        </button>
        <button 
          onClick={handleAdd} 
          disabled={userRole !== 'admin'}
          className={`px-6 py-2 rounded-xl shadow-lg transition-all text-white ${userRole === 'admin' ? 'bg-green-600 hover:bg-green-700 hover:scale-105' : 'bg-green-400 cursor-not-allowed opacity-50'}`}
          title={userRole !== 'admin' ? 'Admin only' : 'Add new transaction'}
        >
          ➕ Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" placeholder="Search description..." value={localSearchTerm} onChange={(e) => setLocalSearchTerm(e.target.value)} className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
          <select value={filters.category} onChange={(e) => updateFilters({ category: e.target.value })} className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700">
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <input type="date" value={filters.dateRange.start} onChange={(e) => updateFilters({ dateRange: { ...filters.dateRange, start: e.target.value } })} className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
          <input type="date" value={filters.dateRange.end} onChange={(e) => updateFilters({ dateRange: { ...filters.dateRange, end: e.target.value } })} className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
        </div>
      </div>

      {/* Transactions Table */}
      {sortedTransactions.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 mx-auto w-24">📋</div>
          <h2 className="text-2xl font-bold text-gray-500 mb-4 dark:text-gray-400">No transactions found</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            {transactions.length === 0 ? 'Click Reset Data to load mocks.' : 'Adjust filters or click Reset Data.'}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">Role: {userRole} | Total: {transactions.length}</div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort('date')}>Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="px-6 py-4 text-left font-semibold">Description</th>
                <th className="px-6 py-4 text-left font-semibold">Category</th>
                <th className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleSort('amount')}>Amount {sortField === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
                <th className="px-6 py-4 text-left font-semibold">Type</th>
                {userRole === 'admin' && <th className="px-6 py-4 text-left font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <td className="px-6 py-4 font-medium">{t.date}</td>
                  <td className="px-6 py-4">{t.description}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-900 dark:text-blue-200 font-medium">
                      {getCategoryName(t.category)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-bold text-lg ${t.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(t.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-sm rounded-full font-semibold ${t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800 dark:bg-green-900 dark:text-green-200 dark:bg-red-900 dark:text-red-200'}`}>
                      {t.type}
                    </span>
                  </td>
                  {userRole === 'admin' && (
                    <td className="px-6 py-4 space-x-2">
                      <button onClick={() => handleEdit(t)} className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg transition-all">Edit</button>
                      <button onClick={() => handleDelete(t.id)} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-all">Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300">
            Showing {sortedTransactions.length} of {transactions.length} transactions | Role: <strong>{userRole}</strong>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">
                  {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                </h2>
                <button onClick={handleCancel} className="text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">&times;</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Date</label>
                  <input 
                    type="date" 
                    value={formData.date} 
                    onChange={(e) => setFormData({...formData, date: e.target.value})} 
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600" 
                    required 
                  />
                  {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Description</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Grocery shopping" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600" 
                    required 
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Category</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})} 
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600" 
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Amount</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={formData.amount} 
                      onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                      min="0" 
                      step="0.01" 
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600" 
                      required 
                    />
                    {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Type</label>
                    <select 
                      value={formData.type} 
                      onChange={(e) => setFormData({...formData, type: e.target.value})} 
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="income">Income (+)</option>
                      <option value="expense">Expense (-)</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all focus:ring-2 focus:ring-blue-500">
                    {editingTransaction ? 'Update' : 'Add'} Transaction
                  </button>
                  <button type="button" onClick={handleCancel} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Transactions;
