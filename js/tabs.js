/**
 * Tab Switching Logic - Basketball Money
 * Uses event delegation to bind clicks early, preventing parse-gap race conditions
 */

// Store pending tab if click occurs before handler is ready
window.__pendingTab = null;

// Event delegation: bind to document, works for all current and future tab elements
document.addEventListener('click', function(e) {
  const tab = e.target.closest('[data-tab]');
  if (!tab) return;
  
  e.preventDefault();
  
  // If showTab is defined, call it immediately
  if (typeof showTab === 'function') {
    showTab(tab.dataset.tab);
  } else {
    // Otherwise store the pending request for replay after init
    window.__pendingTab = tab.dataset.tab;
  }
});

/**
 * Initialize tab system - call this after DOM is ready
 */
function initTabs() {
  console.log('Tab handlers bound');
  
  // If a click came in during parse gap, replay it now
  if (window.__pendingTab) {
    showTab(window.__pendingTab);
    window.__pendingTab = null;
  }
}

/**
 * Show/activate a specific tab
 * @param {string} tabName - The data-tab value (e.g., 'admin', 'coach', 'player')
 */
function showTab(tabName) {
  console.log('Switching to tab:', tabName);
  
  // Deactivate all tabs and views
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  
  // Activate selected tab and view
  const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
  const activeView = document.getElementById(`view-${tabName}`);
  
  if (activeTab) activeTab.classList.add('active');
  if (activeView) {
    activeView.classList.add('active');
    
    // Scroll to view
    activeView.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
  
  // Fire custom event for component-specific logic
  window.dispatchEvent(new CustomEvent('tabChanged', { detail: { tab: tabName } }));
}

// Call initTabs when DOM is ready
document.addEventListener('DOMContentLoaded', initTabs);
