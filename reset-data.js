// reset-data.js - Run in browser console on the app to reset finance state to mocks
(function() {
  localStorage.removeItem('finance-state');
  localStorage.setItem('finance-state', JSON.stringify({
    transactions: [], // Triggers fallback to mocks on load
    filters: { searchTerm: '', category: '', dateRange: { start: '', end: '' } },
    userRole: 'admin', // Set to admin for easy testing
    theme: 'light'
  }));
  console.log('✅ Finance state reset! Refresh page to load fresh mock transactions.');
  window.location.reload();
})();

