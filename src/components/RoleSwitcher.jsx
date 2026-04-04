import React from 'react';
import { useFinance } from '../contexts/FinanceContext';

const RoleSwitcher = () => {
  const { userRole, setUserRole } = useFinance();

  const toggleRole = () => {
    setUserRole(userRole === 'admin' ? 'viewer' : 'admin');
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Role: {userRole === 'admin' ? 'Admin' : 'Viewer'}
      </span>
      <button
        onClick={toggleRole}
        className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
      >
        Switch to {userRole === 'admin' ? 'Viewer' : 'Admin'}
      </button>
    </div>
  );
};

export default RoleSwitcher;