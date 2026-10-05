// Popup controller for TraceX browser extension

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ action: 'GET_STATS' }, (response) => {
    if (response) {
      document.getElementById('benignCount').textContent = response.cachedBenignCount || 0;
      document.getElementById('bypassedCount').textContent = response.bypassedCount || 0;
    }
  });

  document.getElementById('openDashboardBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });
});
