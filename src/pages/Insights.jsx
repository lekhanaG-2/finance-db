import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Insights = () => {
  const { transactions, categories } = useFinance();

  // Prepare data for bar chart: spending by category
  const spendingByCategory = categories.map(cat => {
    const total = transactions
      .filter(t => t.category === cat.id && t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { name: cat.name, amount: total, color: cat.color };
  }).filter(cat => cat.amount > 0).sort((a, b) => b.amount - a.amount);

  // Prepare data for line chart: monthly income vs expenses
  const monthlyData = {};
  transactions.forEach(t => {
    const month = t.date.slice(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { month, income: 0, expenses: 0 };
    }
    if (t.type === 'income') {
      monthlyData[month].income += t.amount;
    } else {
      monthlyData[month].expenses += Math.abs(t.amount);
    }
  });
  const lineData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  // Additional insights
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const monthsCount = lineData.length;
  const averageMonthlySpending = monthsCount > 0 ? totalExpenses / monthsCount : 0;
  const topSpendingMonth = lineData.reduce((top, current) => current.expenses > top.expenses ? current : top, lineData[0] || { month: 'N/A', expenses: 0 });

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 fade-in">Financial Insights</h1>

      {transactions.length === 0 ? (
        <div className="fade-in text-center py-20">
          <div className="text-6xl mb-4">📈</div>
          <h2 className="text-2xl font-bold text-gray-500 dark:text-gray-400 mb-4">No data for insights</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Add transactions to unlock powerful financial insights and charts.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Visit the Transactions tab and switch to Admin mode.</p>
        </div>
      ) : (
        <>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 fade-in">
            {/* Bar Chart: Spending by Category */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md fade-in hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">Highest Spending by Category</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={spendingByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                  <Legend />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart: Monthly Income vs Expenses */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md fade-in hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">Monthly Income vs Expenses</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#ff7300" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Insights */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md fade-in hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">Additional Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded hover:shadow-md transition-shadow fade-in">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">Average Monthly Spending</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${averageMonthlySpending.toFixed(2)}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900 p-4 rounded hover:shadow-md transition-shadow fade-in">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Top Spending Month</h3>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{topSpendingMonth.month}</p>
                <p className="text-sm text-red-600 dark:text-red-400">Expenses: ${topSpendingMonth.expenses.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Insights;