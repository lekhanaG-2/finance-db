import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { transactions } = useFinance();

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netBalance = totalIncome - totalExpenses;

  // Prepare data for monthly spending chart
  const monthlyData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const month = new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!acc[month]) acc[month] = 0;
      acc[month] += Math.abs(t.amount);
      return acc;
    }, {});

  const chartData = Object.keys(monthlyData).map(month => ({
    month,
    expenses: monthlyData[month]
  }));

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center dark:text-white fade-in">Dashboard Overview</h1>

      {transactions.length === 0 ? (
        <div className="fade-in text-center py-20">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-500 dark:text-gray-400 mb-4">No transactions yet</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Add your first transaction to see insights and charts.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Switch to Admin role in the top right to get started.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md fade-in animate-fade-in-up animation-delay-100 card-hover">
              <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">Total Income</h2>
              <p className="text-2xl font-bold dark:text-white">${totalIncome.toFixed(2)}</p>
            </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md fade-in animate-fade-in-up animation-delay-200 card-hover">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Total Expenses</h2>
          <p className="text-2xl font-bold dark:text-white">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md fade-in animate-fade-in-up animation-delay-300 card-hover">
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Net Balance</h2>
          <p className={`text-2xl font-bold dark:text-white ${netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${netBalance.toFixed(2)}
          </p>
        </div>
      </div>

       {/* Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md fade-in animate-fade-in animation-delay-400 card-hover overflow-hidden">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Monthly Spending Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="expenses" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;