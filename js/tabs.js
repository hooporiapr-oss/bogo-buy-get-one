/**
 * Tab Switching Logic - Basketball Money
 * Uses event delegation to bind clicks early, preventing parse-gap race conditions
 * Dynamically loads component files
 */

window.__pendingTab = null;
const componentCache = {};

document.addEventListener('click', function(e) {
  const tab = e.target.closest('[data-tab]');
  if (!tab) return;
  
  e.preventDefault();
  
  if (typeof showTab === 'function') {
    showTab(tab.dataset.tab);
  } else {
    window.__pendingTab = tab.dataset.tab;
  }
});

function initTabs() {
  console.log('Tab handlers bound');
  
  if (window.__pendingTab) {
    showTab(window.__pendingTab);
    window.__pendingTab = null;
  }
}

async function showTab(tabName) {
  console.log('Switching to tab:', tabName);
  
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  
  const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
  const activeView = document.getElementById(`view-${tabName}`);
  
  if (activeTab) activeTab.classList.add('active');
  if (activeView) {
    activeView.classList.add('active');
    
    // Load component if not cached
    if (!componentCache[tabName]) {
      try {
        const response = await fetch(`components/${tabName}.html`);
        const html = await response.text();
        componentCache[tabName] = html;
      } catch (err) {
        console.error(`Failed to load ${tabName} component:`, err);
      }
    }
    
    // Insert cached component
    if (componentCache[tabName]) {
      activeView.innerHTML = componentCache[tabName];
    }
    
    activeView.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
  
  window.dispatchEvent(new CustomEvent('tabChanged', { detail: { tab: tabName } }));
}

document.addEventListener('DOMContentLoaded', initTabs);
